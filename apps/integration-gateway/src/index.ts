import {
  ApplicationError,
  createApplication,
  json,
  readJson,
} from "@powerchain/application-runtime";
import {
  CoinbasePayAdapter,
  MoonPayAdapter,
  SolanaPayAdapter,
  StripeAdapter,
  createIntegrationContext,
  getIntegration,
  HeliusIoTAdapter,
  WayfinderAdapter,
  integrationDefinitions,
  searchIntegrations,
} from "@powerchain/integration";
import { CircleAdapter } from "@powerchain/integration/web3/circle";
import { HeliusAdapter } from "@powerchain/integration/web3/helius";
import { acpAdapterReadiness,getAcpAdapter,ingestPowerChainProviderEvent,verifyInternalBody } from "./acp-runtime.ts";

export const applicationName = "integration-gateway" as const;

interface ExecutionRequest {
  operation?: string;
  payload?: Record<string, unknown>;
  timeoutMs?: number;
}

function authorize(request: Request): void {
  const expected = process.env.INTEGRATION_GATEWAY_TOKEN?.trim();
  if (!expected && process.env.NODE_ENV !== "production") return;
  const supplied = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!expected || supplied !== expected)
    throw new ApplicationError(
      "UNAUTHORIZED",
      "A valid integration gateway token is required",
      401,
    );
}

async function executeProvider(
  provider: string,
  body: ExecutionRequest,
  request: Request,
  requestId: string,
) {
  if (!body.operation || typeof body.operation !== "string")
    throw new ApplicationError(
      "INVALID_OPERATION",
      "Integration operation is required",
      422,
    );
  const timeoutMs = Math.min(Math.max(body.timeoutMs ?? 10_000, 500), 30_000);
  const context = createIntegrationContext({
    requestId,
    timeoutMs,
    idempotencyKey: request.headers.get("idempotency-key") ?? undefined,
  });
  const payload = body.payload ?? {};

  switch (provider) {
    case "helius":
      return new HeliusAdapter({
        apiKey: process.env.HELIUS_API_KEY,
        network:
          process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "devnet"
            ? "devnet"
            : "mainnet",
        baseUrl: process.env.HELIUS_RPC_URL,
      }).execute(
        {
          operation: body.operation as
            "getAsset" | "getAssetsByOwner" | "getPriorityFeeEstimate",
          payload,
        },
        context,
      );
    case "helius-iot":
      return new HeliusIoTAdapter().execute({operation:body.operation as any,payload},context);
    case "wayfinder":
      return new WayfinderAdapter().execute({operation:body.operation as any,payload},context);
    case "circle":
      return new CircleAdapter(
        process.env.CIRCLE_BASE_URL,
        process.env.CIRCLE_API_KEY,
      ).execute(
        {
          operation: body.operation as "getBalances" | "createTransfer",
          payload,
        },
        context,
      );
    case "stripe":
      return new StripeAdapter(
        process.env.STRIPE_SECRET_KEY,
        process.env.STRIPE_BASE_URL,
      ).execute(
        { operation: body.operation as "createCheckoutSession", payload },
        context,
      );
    case "moonpay":
      return new MoonPayAdapter(
        process.env.MOONPAY_API_KEY,
        process.env.MOONPAY_BASE_URL,
      ).execute(
        { operation: body.operation as "getBuyQuote", payload },
        context,
      );
    case "coinbase-pay":
      return new CoinbasePayAdapter(
        process.env.COINBASE_PAY_API_KEY,
        process.env.COINBASE_PAY_BASE_URL,
      ).execute(
        { operation: body.operation as "createSession", payload },
        context,
      );
    case "solana-pay":
      return new SolanaPayAdapter().execute(
        { operation: body.operation as "createTransferUrl", payload },
        context,
      );
    default:
      throw new ApplicationError(
        "EXECUTION_NOT_SUPPORTED",
        "This provider is discoverable but does not expose gateway execution",
        501,
      );
  }
}

export const application = createApplication({
  manifest: {
    id: applicationName,
    name: "PowerChain Integration Gateway",
    version: "1.0.0",
    description:
      "Provider registry and protected integration execution boundary.",
    basePath: "/api/v1/integrations",
    capabilities: [
      "provider-registry",
      "discovery",
      "capabilities",
      "protected-execution",
    ],
  },
  readiness: async () => integrationDefinitions.length > 0 && (await acpAdapterReadiness()).ready,
  routes: [
    {
      method: "GET",
      path: "/api/v1/integrations",
      summary: "Search registered integrations",
      handler(request) {
        return json({
          data: searchIntegrations(
            new URL(request.url).searchParams.get("q") ?? "",
          ),
        });
      },
    },
    {
      method: "GET",
      path: "/api/v1/integrations/:id",
      summary: "Read integration capabilities",
      handler(_request, { params }) {
        const integration = getIntegration(params.id);
        if (!integration)
          throw new ApplicationError(
            "INTEGRATION_NOT_FOUND",
            "Integration was not found",
            404,
          );
        return json(integration);
      },
    },
    {
      method: "POST",
      path: "/api/v1/integrations/:id/execute",
      summary: "Execute a protected provider operation",
      async handler(request, { params, requestId }) {
        authorize(request);
        if (!getIntegration(params.id))
          throw new ApplicationError(
            "INTEGRATION_NOT_FOUND",
            "Integration was not found",
            404,
          );
        const result = await executeProvider(
          params.id,
          await readJson<ExecutionRequest>(request),
          request,
          requestId,
        );
        return json(result, {
          status:
            result.state === "available"
              ? 200
              : result.state === "misconfigured"
                ? 503
                : 422,
        });
      },
    },

    {
      method:"POST",
      path:"/internal/acp/providers/discover",
      summary:"Discover providers through the PowerChain ACP provider network",
      async handler(request){const raw=await request.text();verifyInternalBody(raw,request.headers.get("x-powerchain-internal-signature")??undefined);const body=JSON.parse(raw);return json({data:await getAcpAdapter().discoverProviders(body)});},
    },
    {
      method:"POST",
      path:"/internal/acp/jobs/create",
      summary:"Create an externally authorized ACP job",
      async handler(request){const raw=await request.text();verifyInternalBody(raw,request.headers.get("x-powerchain-internal-signature")??undefined);return json({data:await getAcpAdapter().createJob(JSON.parse(raw))});},
    },
    {
      method:"POST",
      path:"/internal/acp/jobs/fund",
      summary:"Dispatch an exact authorized ACP funding operation",
      async handler(request){const raw=await request.text();verifyInternalBody(raw,request.headers.get("x-powerchain-internal-signature")??undefined);return json({data:await getAcpAdapter().fundJob(JSON.parse(raw))});},
    },
    {
      method:"POST",
      path:"/internal/acp/jobs/complete",
      summary:"Dispatch an exact authorized ACP completion operation",
      async handler(request){const raw=await request.text();verifyInternalBody(raw,request.headers.get("x-powerchain-internal-signature")??undefined);return json({data:await getAcpAdapter().completeJob(JSON.parse(raw))});},
    },
    {
      method:"POST",
      path:"/internal/acp/jobs/reject",
      summary:"Dispatch an exact authorized ACP rejection operation",
      async handler(request){const raw=await request.text();verifyInternalBody(raw,request.headers.get("x-powerchain-internal-signature")??undefined);return json({data:await getAcpAdapter().rejectJob(JSON.parse(raw))});},
    },
    {
      method:"POST",
      path:"/internal/acp/jobs/get",
      summary:"Read the external ACP lifecycle snapshot for reconciliation",
      async handler(request){const raw=await request.text();verifyInternalBody(raw,request.headers.get("x-powerchain-internal-signature")??undefined);return json({data:await getAcpAdapter().getJob(JSON.parse(raw))});},
    },

    {
      method:"POST",
      path:"/api/v1/acp/provider-events/:providerId",
      summary:"Ingest a signed external provider observation into the durable ACP event inbox",
      async handler(request,{params}){const raw=await request.text();const result=await ingestPowerChainProviderEvent({providerId:params.providerId,signature:request.headers.get("x-powerchain-provider-signature")??undefined,body:raw});return json({data:result},{status:202});},
    },
    {
      method:"GET",
      path:"/api/v1/acp-adapter/health",
      summary:"Read the isolated ACP adapter health state",
      async handler(){return json(await acpAdapterReadiness());},
    },
  ],
});
