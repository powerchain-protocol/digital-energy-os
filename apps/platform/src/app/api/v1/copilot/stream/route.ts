import { CopilotRepository } from "@powerchain/database/copilot";
import { CopilotCreditRepository } from "@powerchain/database/copilot-credits";
import { EnergyMonitoringRepository } from "@powerchain/database/energy-monitoring";
import { runRenewablesAgent } from "@/agents/renewables";
import { getCopilotCreditQuote,pricingClassForWorkspace } from "@/lib/ai/billing/pricing";
import { withApi,ApiError } from "@/lib/api/with-api";

const repository=new CopilotRepository();
const creditRepository=new CopilotCreditRepository();
const energyRepository=new EnergyMonitoringRepository();
const encoder=new TextEncoder();

function event(controller:ReadableStreamDefaultController<Uint8Array>,type:string,data:unknown){controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`))}
function chunks(text:string){const words=text.split(/(\s+)/);const out:string[]=[];let current="";for(const word of words){current+=word;if(current.length>=22){out.push(current);current=""}}if(current)out.push(current);return out}
function evidenceFor(message:string){const evidence=[] as Array<{id:string;type:string;label:string;href:string}>;const q=message.toLowerCase();if(/energy|solar|wind|meter|device/.test(q))evidence.push({id:"energy",type:"energy",label:"My Energy",href:"/my-energy"});if(/device|iot|meter|inverter|helium|depin/.test(q))evidence.push({id:"devices",type:"devices",label:"Connected Devices",href:"/my-energy/devices"});if(/treasury|settlement|revenue|wallet/.test(q))evidence.push({id:"treasury",type:"treasury",label:"Treasury",href:"/treasury"});if(/alert|risk|anomaly/.test(q))evidence.push({id:"alerts",type:"alerts",label:"Alerts",href:"/analytics"});if(/report|evidence|audit/.test(q))evidence.push({id:"reports",type:"reports",label:"Documentation & Reports",href:"/docs"});return evidence}
function reviewIntent(message:string){const q=message.toLowerCase();if(/trade|buy|sell|rent|transfer|mint|issue token|restart|command device|settle/.test(q))return{state:"review_required",reason:"The requested operation is consequential. Copilot can prepare an Action Intent but cannot silently execute or sign it.",actionHref:"/copilot/action-center"};return null}
function creditsEnabled(){const configured=process.env.POWERCHAIN_COPILOT_CREDITS_ENABLED?.trim().toLowerCase();if(configured==="false")return false;if(configured==="true")return true;return Boolean(process.env.DATABASE_URL?.trim())}

export async function POST(request:Request){
  return withApi(request,{auth:"required",json:true,mutation:true},async context=>{
    const body=context.body as Record<string,unknown>;
    const message=typeof body.message==="string"?body.message.trim():"";
    const pageContext=body.pageContext&&typeof body.pageContext==="object"?body.pageContext as Record<string,unknown>:null;
    if(!message)throw new ApiError("COPILOT_MESSAGE_REQUIRED","Message is required",400);
    if(message.length>2000)throw new ApiError("COPILOT_MESSAGE_TOO_LONG","Messages are limited to 2,000 characters",400);

    const summary=await energyRepository.summary(context.organizationId!);
    const pricingClass=pricingClassForWorkspace({sourceMode:summary.sourceMode,pageContext});
    const quote=await getCopilotCreditQuote(pricingClass);
    const metering=creditsEnabled();
    if(process.env.NODE_ENV==="production"&&!metering)throw new ApiError("COPILOT_CREDITS_REQUIRED","PWRC-backed Copilot credits must be enabled in production",503);
    if(metering&&!process.env.DATABASE_URL?.trim())throw new ApiError("COPILOT_CREDITS_DATABASE_REQUIRED","Copilot credit metering requires PostgreSQL",503);

    let creditReservation:null|Awaited<ReturnType<CopilotCreditRepository["reserve"]>>=null;
    if(metering){
      try{creditReservation=await creditRepository.reserve({organizationId:context.organizationId!,userId:context.user!.id,requestId:context.requestId,quote})}
      catch(error){
        if(error&&typeof error==="object"&&"code" in error&&String((error as{code?:unknown}).code)==="COPILOT_CREDITS_INSUFFICIENT"){
          throw new ApiError("COPILOT_CREDITS_INSUFFICIENT","Insufficient PWRC Copilot credits",402,{quote,buyCreditsHref:"/settings/credits"});
        }
        throw error;
      }
    }

    let conversationId=typeof body.conversationId==="string"?body.conversationId.trim():"";
    try{
      if(conversationId&&!await repository.conversation(context.user!.id,conversationId))throw new ApiError("COPILOT_CONVERSATION_NOT_FOUND","Conversation not found",404);
      if(!conversationId)conversationId=(await repository.createConversation(context.user!.id,"powerchain-copilot")).id;
      const userMessage=await repository.addMessage({userId:context.user!.id,conversationId,role:"user",content:message,metadata:{requestId:context.requestId,traceId:context.traceId,correlationId:context.correlationId,pageContext,pricingClass,creditReservationId:creditReservation?.id}});
      const started=Date.now();
      const stream=new ReadableStream<Uint8Array>({async start(controller){
        let assistant="";let closed=false;let settled=false;
        const heartbeat=setInterval(()=>{if(!closed&&!request.signal.aborted)try{event(controller,"heartbeat",{requestId:context.requestId,at:new Date().toISOString()})}catch{}},10_000);
        const release=async(reason:string)=>{if(creditReservation&&!settled){await creditRepository.release({organizationId:context.organizationId!,reservationId:creditReservation.id,reason}).catch(()=>undefined)}};
        try{
          event(controller,"meta",{requestId:context.requestId,traceId:context.traceId,correlationId:context.correlationId,conversationId,userMessageId:userMessage.id});
          event(controller,"billing",{state:creditReservation?"reserved":"unconfigured",pricingClass,usdCharge:quote.usdCharge,pwrcAmount:quote.pwrcAmount,pwrcRaw:quote.pwrcRaw,pwrcUsdPrice:quote.pwrcUsdPrice,...(quote.solEquivalent?{solEquivalent:quote.solEquivalent,solUsdPrice:quote.solUsdPrice,solPriceSource:quote.solPriceSource}:{}),reservationId:creditReservation?.id,onchainPerMessage:false});
          event(controller,"stage",{stage:"context",label:"Context",state:"active"});
          if(request.signal.aborted){await release("operator_cancelled_before_generation");closed=true;clearInterval(heartbeat);controller.close();return}
          event(controller,"context",{page:pageContext?.page??null,label:pageContext?.label??null,energy:{sourceMode:summary.sourceMode,activeDevices:summary.activeDevices,attentionDevices:summary.attentionDevices,staleDevices:summary.staleDevices},authority:"Server-resolved tenant data remains authoritative; page context only narrows the operator view."});
          event(controller,"stage",{stage:"context",label:"Context",state:"complete"});
          event(controller,"stage",{stage:"generate",label:"Generate",state:"active"});
          const result=await runRenewablesAgent({prompt:message,requestId:context.requestId,userId:context.user!.id,signal:request.signal});
          assistant=`${result.summary}\n\n${result.recommendations.map((item,index)=>`${index+1}. ${item}`).join("\n")}`;
          let streamed="";
          for(const chunk of chunks(assistant)){
            if(request.signal.aborted){await repository.addMessage({userId:context.user!.id,conversationId,role:"assistant",content:streamed,metadata:{status:"cancelled",requestId:context.requestId,pricingClass,creditReservationId:creditReservation?.id}}).catch(()=>undefined);await release("operator_cancelled_generation");closed=true;clearInterval(heartbeat);controller.close();return}
            streamed+=chunk;event(controller,"delta",{text:chunk});await new Promise(resolve=>setTimeout(resolve,12));
          }
          event(controller,"stage",{stage:"generate",label:"Generate",state:"complete"});
          event(controller,"stage",{stage:"verify",label:"Verify",state:"active"});
          const evidence=evidenceFor(message);const intent=reviewIntent(message);
          const assistantMessage=await repository.addMessage({userId:context.user!.id,conversationId,role:"assistant",content:assistant,metadata:{status:"complete",grounding:evidence.length?"workspace":"limited",evidence,confidence:result.confidence,provider:result.provider,modelId:result.modelId,executionMode:result.executionMode,latencyMs:Date.now()-started,requestId:context.requestId,traceId:context.traceId,correlationId:context.correlationId,pricingClass,usdCharge:quote.usdCharge,pwrcAmount:quote.pwrcAmount,pwrcRaw:quote.pwrcRaw,creditReservationId:creditReservation?.id,...(quote.solEquivalent?{solEquivalent:quote.solEquivalent}:{}) ,...(intent?{reviewIntent:intent}:{})}});
          if(creditReservation){await creditRepository.settle({organizationId:context.organizationId!,reservationId:creditReservation.id,actualPwrcRaw:quote.pwrcRaw,messageId:assistantMessage.id,provider:result.provider,modelId:result.modelId});settled=true;event(controller,"billing",{state:"settled",pricingClass,usdCharge:quote.usdCharge,pwrcAmount:quote.pwrcAmount,pwrcRaw:quote.pwrcRaw,reservationId:creditReservation.id,messageId:assistantMessage.id,onchainPerMessage:false})}
          event(controller,"evidence",{grounding:evidence.length?"workspace":"limited",sources:evidence});if(intent)event(controller,"review_intent",intent);
          event(controller,"usage",{inputCharacters:message.length,outputCharacters:assistant.length,latencyMs:Date.now()-started,provider:result.provider,modelId:result.modelId,executionMode:result.executionMode,pricingClass,usdCharge:quote.usdCharge,pwrcAmount:quote.pwrcAmount});
          event(controller,"stage",{stage:"verify",label:"Verify",state:"complete"});event(controller,"done",{conversationId,assistantMessageId:assistantMessage.id,createdAt:assistantMessage.createdAt});closed=true;clearInterval(heartbeat);controller.close();
        }catch(error){await release("generation_or_persistence_failed");event(controller,"error",{code:"COPILOT_STREAM_FAILED",message:error instanceof Error?error.message:"Copilot stream failed",requestId:context.requestId});closed=true;clearInterval(heartbeat);controller.close()}finally{closed=true;clearInterval(heartbeat)}}});
      return new Response(stream,{status:200,headers:{"content-type":"text/event-stream; charset=utf-8","cache-control":"no-cache, no-transform","connection":"keep-alive","x-accel-buffering":"no","x-request-id":context.requestId,"x-trace-id":context.traceId,"x-correlation-id":context.correlationId}});
    }catch(error){if(creditReservation)await creditRepository.release({organizationId:context.organizationId!,reservationId:creditReservation.id,reason:"request_setup_failed"}).catch(()=>undefined);throw error}
  });
}
