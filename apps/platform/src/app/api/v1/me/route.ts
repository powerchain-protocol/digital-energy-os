import { getSession } from "@/lib/auth/sessions";
import { SESSION_COOKIE,securityHeaders } from "@/lib/security/security";

function readCookie(request:Request,name:string){const raw=request.headers.get("cookie");if(!raw)return null;for(const part of raw.split(";")){const[key,...rest]=part.trim().split("=");if(key===name)return decodeURIComponent(rest.join("="))}return null}
export async function GET(request:Request){const session=getSession(readCookie(request,SESSION_COOKIE));if(!session)return Response.json({ok:false,error:{code:"AUTH_REQUIRED",message:"Authentication is required"}},{status:401,headers:securityHeaders});return Response.json({ok:true,data:{user:session.user,session:{issuedAt:session.issuedAt,expiresAt:session.expiresAt}}},{headers:securityHeaders})}
