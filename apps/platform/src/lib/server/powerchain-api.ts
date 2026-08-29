import "server-only";

import { createIntegrationContext, web3 } from "@powerchain/integration";
import { SOLANA_PROGRAM_IDS, CCT_TOKEN, cctDeploymentConfig } from "@powerchain/token-framework";
import { publicKeySchema } from "@powerchain/types";
import { getBirdeyePrice } from "@/clients/birdeye";
import { getAccountInfo, solanaRpc, solanaRpcSource } from "@/solana/solana";

export const POWERCHAIN_API_VERSION = "1.0.0" as const;

type Settled<T> = { ok: true; value: T } | { ok: false; error: string };
type ProviderState = "READY" | "UNCONFIGURED" | "UNAVAILABLE" | "NOT_MAPPED";

function settled<T>(result: PromiseSettledResult<T>): Settled<T> {
  return result.status === "fulfilled"
    ? { ok: true, value: result.value }
    : { ok: false, error: result.reason instanceof Error ? result.reason.message : String(result.reason) };
}

function finite(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

export function validateSolanaMint(value: string | null | undefined): string {
  const parsed = publicKeySchema.safeParse(value ?? "");
  if (!parsed.success) {
    throw Object.assign(new Error("A valid Solana mint address is required"), {
      code: "SOLANA_MINT_INVALID",
      status: 400,
    });
  }
  return parsed.data;
}

export function configuredPwrcMint(): string | null {
  return process.env.PWRC_MINT?.trim()
    || process.env.POWERCHAIN_PWRC_MINT?.trim()
    || process.env.NEXT_PUBLIC_PWRC_MINT?.trim()
    || null;
}

export function currentSolanaCluster() {
  const configured = process.env.SOLANA_CLUSTER?.trim() || process.env.NEXT_PUBLIC_SOLANA_CLUSTER?.trim();
  return configured === "mainnet-beta" || configured === "testnet" || configured === "localnet" || configured === "devnet"
    ? configured
    : "devnet";
}

export async function getSolanaOverview() {
  const [health, version, slot, blockHeight, epochInfo, latestBlockhash, genesisHash] = await Promise.allSettled([
    solanaRpc<string>("getHealth"),
    solanaRpc<{ "solana-core": string; "feature-set": number }>("getVersion"),
    solanaRpc<number>("getSlot", [{ commitment: "confirmed" }]),
    solanaRpc<number>("getBlockHeight", [{ commitment: "confirmed" }]),
    solanaRpc<{
      absoluteSlot: number;
      blockHeight: number;
      epoch: number;
      slotIndex: number;
      slotsInEpoch: number;
      transactionCount?: number;
    }>("getEpochInfo", [{ commitment: "confirmed" }]),
    solanaRpc<{ context: { slot: number }; value: { blockhash: string; lastValidBlockHeight: number } }>("getLatestBlockhash", [{ commitment: "confirmed" }]),
    solanaRpc<string>("getGenesisHash"),
  ]);

  const normalized = {
    health: settled(health),
    rpcVersion: settled(version),
    slot: settled(slot),
    blockHeight: settled(blockHeight),
    epochInfo: settled(epochInfo),
    latestBlockhash: settled(latestBlockhash),
    genesisHash: settled(genesisHash),
  };
  const failures = Object.values(normalized).filter((item) => !item.ok).length;

  return {
    version: POWERCHAIN_API_VERSION,
    network: "solana" as const,
    cluster: currentSolanaCluster(),
    state: failures === 0 ? "READY" as const : failures < Object.keys(normalized).length ? "DEGRADED" as const : "UNAVAILABLE" as const,
    rpc: solanaRpcSource(),
    rpcConfigured: solanaRpcSource().configured,
    heliusConfigured: Boolean(process.env.HELIUS_API_KEY?.trim() || process.env.HELIUS_RPC_URL?.trim()),
    observedAt: new Date().toISOString(),
    ...normalized,
  };
}

type ProgramDefinition = {
  id: string;
  name: string;
  domain: string;
  status: "test" | "scaffold" | "production";
  envBase: string;
  launchpad?: boolean;
};

const POWERCHAIN_PROGRAMS: readonly ProgramDefinition[] = [
  { id: "powerchain-core", name: "PowerChain Core", domain: "core", status: "test", envBase: "POWERCHAIN_PROGRAM_ID" },
  { id: "launchpad-core", name: "PowerChain Launchpad", domain: "launchpad", status: "scaffold", envBase: "POWERCHAIN_LAUNCHPAD_PROGRAM_ID", launchpad: true },
  { id: "launch-policy", name: "Launch Policy", domain: "launchpad", status: "scaffold", envBase: "POWERCHAIN_LAUNCH_POLICY_PROGRAM_ID", launchpad: true },
  { id: "token-2022-vesting", name: "Token-2022 Vesting", domain: "launchpad", status: "scaffold", envBase: "POWERCHAIN_TOKEN_2022_VESTING_PROGRAM_ID", launchpad: true },
  { id: "token-factory", name: "Token Factory", domain: "tokenization", status: "scaffold", envBase: "POWERCHAIN_TOKEN_FACTORY_PROGRAM_ID", launchpad: true },
  { id: "meter-registry", name: "Meter Registry", domain: "metering", status: "test", envBase: "POWERCHAIN_METER_REGISTRY_PROGRAM_ID" },
  { id: "oracle-registry", name: "Oracle Registry", domain: "depin", status: "test", envBase: "POWERCHAIN_ORACLE_REGISTRY_PROGRAM_ID" },
  { id: "proof-of-energy", name: "Proof of Energy", domain: "energy", status: "test", envBase: "POWERCHAIN_PROOF_OF_ENERGY_PROGRAM_ID" },
  { id: "energy-token", name: "Energy Token", domain: "tokenization", status: "test", envBase: "POWERCHAIN_ENERGY_TOKEN_PROGRAM_ID" },
  { id: "marketplace", name: "Energy Marketplace", domain: "exchange", status: "test", envBase: "POWERCHAIN_MARKETPLACE_PROGRAM_ID" },
  { id: "escrow", name: "Escrow", domain: "settlement", status: "test", envBase: "POWERCHAIN_ESCROW_PROGRAM_ID", launchpad: true },
  { id: "treasury", name: "Treasury", domain: "finance", status: "test", envBase: "POWERCHAIN_TREASURY_PROGRAM_ID" },
  { id: "governance", name: "Governance", domain: "governance", status: "test", envBase: "POWERCHAIN_GOVERNANCE_PROGRAM_ID" },
  { id: "pwrc-bridge", name: "PWRC Bridge", domain: "bridge", status: "scaffold", envBase: "POWERCHAIN_PWRC_BRIDGE_PROGRAM_ID" },
  { id: "cct-registry", name: "PowerChain CCT Registry", domain: "carbon", status: "scaffold", envBase: "POWERCHAIN_CCT_PROGRAM_ID" },
] as const;

function clusterSuffix() {
  const cluster = currentSolanaCluster();
  return cluster === "mainnet-beta" ? "MAINNET" : cluster === "devnet" ? "DEVNET" : cluster === "testnet" ? "TESTNET" : "LOCALNET";
}

function configuredProgramId(definition: ProgramDefinition): { programId: string | null; configurationKey: string } {
  const scopedKey = `${definition.envBase}_${clusterSuffix()}`;
  const scoped = process.env[scopedKey]?.trim();
  if (scoped) return { programId: scoped, configurationKey: scopedKey };
  const general = process.env[definition.envBase]?.trim();
  if (general) return { programId: general, configurationKey: definition.envBase };
  return { programId: null, configurationKey: definition.envBase };
}

function configuredProgramSummary() {
  return POWERCHAIN_PROGRAMS.map((definition) => ({ ...definition, ...configuredProgramId(definition) }));
}

type ProgramAccount = {
  context?: { slot?: number };
  value: null | {
    executable?: boolean;
    lamports?: number;
    owner?: string;
    rentEpoch?: number;
    space?: number;
    data?: unknown;
  };
};

async function verifyProgram(definition: ProgramDefinition) {
  const configured = configuredProgramId(definition);
  if (!configured.programId) {
    return {
      ...definition,
      ...configured,
      network: currentSolanaCluster(),
      deploymentState: "NOT_CONFIGURED" as const,
      verified: false,
      deploymentBlocking: true,
    };
  }
  const parsed = publicKeySchema.safeParse(configured.programId);
  if (!parsed.success) {
    return {
      ...definition,
      ...configured,
      network: currentSolanaCluster(),
      deploymentState: "INVALID_PROGRAM_ID" as const,
      verified: false,
      deploymentBlocking: true,
    };
  }
  try {
    const account = await solanaRpc<ProgramAccount>("getAccountInfo", [configured.programId, { encoding: "base64", commitment: "confirmed" }]);
    if (!account.value) {
      return { ...definition, ...configured, network: currentSolanaCluster(), deploymentState: "ACCOUNT_NOT_FOUND" as const, verified: false, deploymentBlocking: true, verifiedAtSlot: account.context?.slot ?? null };
    }
    const executable = account.value.executable === true;
    return {
      ...definition,
      ...configured,
      network: currentSolanaCluster(),
      deploymentState: executable ? "DEPLOYED" as const : "NOT_EXECUTABLE" as const,
      verified: executable,
      deploymentBlocking: !executable,
      accountOwner: account.value.owner ?? null,
      executable,
      dataLength: account.value.space ?? null,
      verifiedAtSlot: account.context?.slot ?? null,
    };
  } catch (error) {
    return {
      ...definition,
      ...configured,
      network: currentSolanaCluster(),
      deploymentState: "RPC_UNAVAILABLE" as const,
      verified: false,
      deploymentBlocking: true,
      verificationError: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getPowerChainPrograms() {
  const programs = await Promise.all(POWERCHAIN_PROGRAMS.map(verifyProgram));
  return {
    version: POWERCHAIN_API_VERSION,
    cluster: currentSolanaCluster(),
    programs,
    configured: programs.filter((program) => program.programId).length,
    verified: programs.filter((program) => program.verified).length,
    launchpad: {
      configured: programs.filter((program) => program.launchpad && program.programId).length,
      verified: programs.filter((program) => program.launchpad && program.verified).length,
      programs: programs.filter((program) => program.launchpad),
    },
    total: programs.length,
    observedAt: new Date().toISOString(),
  };
}

export async function getSolanaPrograms() {
  const powerchain = await getPowerChainPrograms();
  return {
    version: POWERCHAIN_API_VERSION,
    cluster: powerchain.cluster,
    standardPrograms: [
      { id: "system", name: "System Program", programId: SOLANA_PROGRAM_IDS.system },
      { id: "spl-token", name: "SPL Token Program", programId: SOLANA_PROGRAM_IDS.splToken },
      { id: "token-2022", name: "Token-2022 Program", programId: SOLANA_PROGRAM_IDS.token2022 },
      { id: "associated-token", name: "Associated Token Account Program", programId: SOLANA_PROGRAM_IDS.associatedToken },
      { id: "metaplex-token-metadata", name: "Metaplex Token Metadata", programId: SOLANA_PROGRAM_IDS.metaplexTokenMetadata },
    ],
    powerchainPrograms: powerchain.programs,
    launchpad: powerchain.launchpad,
    observedAt: new Date().toISOString(),
  };
}

function parsePythFeedMap(): Record<string, string> {
  const raw = process.env.POWERCHAIN_PYTH_FEED_MAP_JSON?.trim();
  if (!raw) return {};
  try {
    const value = JSON.parse(raw) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).filter(([, feed]) => typeof feed === "string" && feed.trim()).map(([mint, feed]) => [mint, String(feed).replace(/^0x/, "").trim()]));
  } catch {
    return {};
  }
}

async function resolvePythMarket(mint: string) {
  const feedId = parsePythFeedMap()[mint];
  if (!feedId) return { state: "NOT_MAPPED" as ProviderState, provider: "pyth" as const };
  const base = (process.env.PYTH_PRICE_SERVICE_URL?.trim() || "https://hermes.pyth.network").replace(/\/$/, "");
  try {
    const response = await fetch(`${base}/v2/updates/price/latest?ids[]=${encodeURIComponent(feedId)}&parsed=true`, { cache: "no-store", signal: AbortSignal.timeout(6_000) });
    if (!response.ok) return { state: "UNAVAILABLE" as ProviderState, provider: "pyth" as const, feedId, error: `HTTP ${response.status}` };
    const body = await response.json() as { parsed?: Array<{ price?: { price?: string; expo?: number; publish_time?: number }; ema_price?: { price?: string; expo?: number } }> };
    const parsed = body.parsed?.[0];
    const rawPrice = finite(parsed?.price?.price);
    const expo = typeof parsed?.price?.expo === "number" ? parsed.price.expo : null;
    const priceUsd = rawPrice !== null && expo !== null ? rawPrice * (10 ** expo) : null;
    return {
      state: priceUsd !== null ? "READY" as ProviderState : "UNAVAILABLE" as ProviderState,
      provider: "pyth" as const,
      feedId,
      priceUsd,
      publishedAt: parsed?.price?.publish_time ? new Date(parsed.price.publish_time * 1000).toISOString() : null,
    };
  } catch (error) {
    return { state: "UNAVAILABLE" as ProviderState, provider: "pyth" as const, feedId, error: error instanceof Error ? error.message : String(error) };
  }
}

async function resolveCoinGeckoMarket(mint: string) {
  const proKey = process.env.COINGECKO_API_KEY?.trim();
  const demoKey = process.env.COINGECKO_DEMO_API_KEY?.trim();
  const base = (process.env.COINGECKO_API_BASE_URL?.trim() || (proKey ? "https://pro-api.coingecko.com/api/v3" : "https://api.coingecko.com/api/v3")).replace(/\/$/, "");
  const headers: Record<string, string> = { accept: "application/json" };
  if (proKey) headers["x-cg-pro-api-key"] = proKey;
  else if (demoKey) headers["x-cg-demo-api-key"] = demoKey;
  try {
    const params = new URLSearchParams({
      contract_addresses: mint,
      vs_currencies: "usd",
      include_market_cap: "true",
      include_24hr_vol: "true",
      include_24hr_change: "true",
      include_last_updated_at: "true",
      precision: "full",
    });
    const response = await fetch(`${base}/simple/token_price/solana?${params}`, { headers, cache: "no-store", signal: AbortSignal.timeout(6_000) });
    if (!response.ok) return { state: "UNAVAILABLE" as ProviderState, provider: "coingecko" as const, error: `HTTP ${response.status}` };
    const body = await response.json() as Record<string, Record<string, unknown>>;
    const row = body[mint] ?? body[mint.toLowerCase()] ?? null;
    const priceUsd = finite(row?.usd);
    return {
      state: priceUsd !== null ? "READY" as ProviderState : "UNAVAILABLE" as ProviderState,
      provider: "coingecko" as const,
      priceUsd,
      marketCapUsd: finite(row?.usd_market_cap),
      volume24hUsd: finite(row?.usd_24h_vol),
      change24hPercent: finite(row?.usd_24h_change),
      publishedAt: finite(row?.last_updated_at) ? new Date(Number(row?.last_updated_at) * 1000).toISOString() : null,
    };
  } catch (error) {
    return { state: "UNAVAILABLE" as ProviderState, provider: "coingecko" as const, error: error instanceof Error ? error.message : String(error) };
  }
}

async function resolveCoinMarketCapMarket(mint: string) {
  const apiKey = process.env.COINMARKETCAP_API_KEY?.trim();
  const base = (process.env.COINMARKETCAP_API_BASE_URL?.trim() || "https://pro-api.coinmarketcap.com").replace(/\/$/, "");
  const path = apiKey ? "/v1/dex/token/price" : "/public-api/v1/dex/token/price";
  const headers: Record<string, string> = { accept: "application/json" };
  if (apiKey) headers["X-CMC_PRO_API_KEY"] = apiKey;
  try {
    const params = new URLSearchParams({ platform: "solana", address: mint });
    const response = await fetch(`${base}${path}?${params}`, { headers, cache: "no-store", signal: AbortSignal.timeout(6_000) });
    if (!response.ok) return { state: "UNAVAILABLE" as ProviderState, provider: "coinmarketcap" as const, error: `HTTP ${response.status}` };
    const row = await response.json() as Record<string, unknown>;
    const priceUsd = finite(row.p);
    return {
      state: priceUsd !== null ? "READY" as ProviderState : "UNAVAILABLE" as ProviderState,
      provider: "coinmarketcap" as const,
      priceUsd,
      liquidityUsd: finite(row.l),
      marketCapUsd: finite(row.mc),
      volume24hUsd: finite(row.v24h),
      change24hPercent: finite(row.pc24h),
      symbol: typeof row.sym === "string" ? row.sym : null,
      name: typeof row.n === "string" ? row.n : null,
      publishedAt: finite(row.ts) ? new Date(Number(row.ts) * (Number(row.ts) < 10_000_000_000 ? 1000 : 1)).toISOString() : null,
    };
  } catch (error) {
    return { state: "UNAVAILABLE" as ProviderState, provider: "coinmarketcap" as const, error: error instanceof Error ? error.message : String(error) };
  }
}

function extractBirdeyePrice(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;
  const data = (payload as Record<string, unknown>).data;
  if (data && typeof data === "object") return finite((data as Record<string, unknown>).value);
  return null;
}

async function resolveBirdeyeMarket(mint: string) {
  if (!process.env.BIRDEYE_API_KEY?.trim()) return { state: "UNCONFIGURED" as ProviderState, provider: "birdeye" as const };
  try {
    const raw = await getBirdeyePrice(mint);
    const priceUsd = extractBirdeyePrice(raw);
    return { state: priceUsd !== null ? "READY" as ProviderState : "UNAVAILABLE" as ProviderState, provider: "birdeye" as const, priceUsd };
  } catch (error) {
    return { state: "UNAVAILABLE" as ProviderState, provider: "birdeye" as const, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function getSolanaMarket(mintInput: string | null | undefined) {
  const mint = validateSolanaMint(mintInput);
  const [pyth, coingecko, coinmarketcap, birdeye] = await Promise.all([
    resolvePythMarket(mint),
    resolveCoinGeckoMarket(mint),
    resolveCoinMarketCapMarket(mint),
    resolveBirdeyeMarket(mint),
  ]);
  const providers = { pyth, coingecko, coinmarketcap, birdeye };
  const ordered = [pyth, coingecko, coinmarketcap, birdeye];
  const priceSource = ordered.find((entry) => entry.state === "READY" && finite((entry as { priceUsd?: unknown }).priceUsd) !== null) as (typeof ordered)[number] | undefined;
  const marketSources = [coingecko, coinmarketcap, birdeye];
  const liquiditySource = marketSources.find((entry) => finite((entry as { liquidityUsd?: unknown }).liquidityUsd) !== null);
  const volumeSource = marketSources.find((entry) => finite((entry as { volume24hUsd?: unknown }).volume24hUsd) !== null);
  const changeSource = marketSources.find((entry) => finite((entry as { change24hPercent?: unknown }).change24hPercent) !== null);
  const capSource = marketSources.find((entry) => finite((entry as { marketCapUsd?: unknown }).marketCapUsd) !== null);
  const available = ordered.some((entry) => entry.state === "READY");
  const configuredOrAttempted = ordered.some((entry) => entry.state !== "UNCONFIGURED" && entry.state !== "NOT_MAPPED");

  return {
    version: POWERCHAIN_API_VERSION,
    mint,
    network: "solana" as const,
    cluster: currentSolanaCluster(),
    state: available ? "READY" as const : configuredOrAttempted ? "UNAVAILABLE" as const : "UNCONFIGURED" as const,
    provider: priceSource?.provider ?? null,
    priceUsd: priceSource ? finite((priceSource as { priceUsd?: unknown }).priceUsd) : null,
    liquidityUsd: liquiditySource ? finite((liquiditySource as { liquidityUsd?: unknown }).liquidityUsd) : null,
    volume24hUsd: volumeSource ? finite((volumeSource as { volume24hUsd?: unknown }).volume24hUsd) : null,
    change24hPercent: changeSource ? finite((changeSource as { change24hPercent?: unknown }).change24hPercent) : null,
    marketCapUsd: capSource ? finite((capSource as { marketCapUsd?: unknown }).marketCapUsd) : null,
    providers,
    resolutionOrder: ["pyth", "coingecko", "coinmarketcap", "birdeye"] as const,
    observedAt: new Date().toISOString(),
  };
}

type JsonParsedMintAccount = {
  context?: { slot?: number };
  value: null | {
    data?: {
      parsed?: {
        type?: string;
        info?: Record<string, unknown>;
      };
      program?: string;
      space?: number;
    } | [string, string];
    executable?: boolean;
    lamports?: number;
    owner?: string;
    rentEpoch?: number;
    space?: number;
  };
};

type TokenSupplyResult = {
  context?: { slot?: number };
  value?: {
    amount?: string;
    decimals?: number;
    uiAmount?: number | null;
    uiAmountString?: string;
  };
};

function inspectMintAccount(account: JsonParsedMintAccount | null | undefined) {
  const value = account?.value;
  const owner = value?.owner ?? null;
  const standard = owner === SOLANA_PROGRAM_IDS.token2022
    ? "TOKEN_2022" as const
    : owner === SOLANA_PROGRAM_IDS.splToken
      ? "SPL_TOKEN" as const
      : "UNKNOWN" as const;
  const data = value?.data && !Array.isArray(value.data) ? value.data : null;
  const parsed = data?.parsed;
  const info = parsed?.info ?? {};
  const extensions = Array.isArray(info.extensions)
    ? info.extensions.map((extension) => {
        if (!extension || typeof extension !== "object") return { extension: String(extension) };
        const source = extension as Record<string, unknown>;
        return { extension: String(source.extension ?? source.type ?? "unknown"), ...source };
      })
    : [];
  return {
    exists: Boolean(value),
    ownerProgramId: owner,
    standard,
    parsedType: parsed?.type ?? null,
    isMint: parsed?.type === "mint",
    decimals: finite(info.decimals),
    supplyRaw: typeof info.supply === "string" ? info.supply : null,
    authorities: {
      mintAuthority: typeof info.mintAuthority === "string" ? info.mintAuthority : null,
      freezeAuthority: typeof info.freezeAuthority === "string" ? info.freezeAuthority : null,
    },
    extensions,
    executable: value?.executable === true,
    lamports: value?.lamports ?? null,
    dataLength: value?.space ?? data?.space ?? null,
    observedAtSlot: account?.context?.slot ?? null,
  };
}

export async function getSolanaAsset(mintInput: string | null | undefined) {
  const mint = validateSolanaMint(mintInput);
  const cluster = currentSolanaCluster();
  const helius = new web3.HeliusAdapter({
    apiKey: process.env.HELIUS_API_KEY?.trim(),
    network: cluster === "mainnet-beta" ? "mainnet" : "devnet",
    baseUrl: process.env.HELIUS_RPC_URL?.trim(),
  });
  const context = createIntegrationContext({ timeoutMs: 8_000 });
  const [heliusResult, accountResult, supplyResult] = await Promise.allSettled([
    helius.execute({ operation: "getAsset", payload: { id: mint } }, context),
    getAccountInfo(mint) as Promise<JsonParsedMintAccount>,
    solanaRpc<TokenSupplyResult>("getTokenSupply", [mint, { commitment: "confirmed" }]),
  ]);
  const heliusNormalized = settled(heliusResult);
  const accountNormalized = settled(accountResult);
  const supplyNormalized = settled(supplyResult);
  const heliusAvailable = heliusNormalized.ok && heliusNormalized.value.state === "available";
  const rpcAvailable = accountNormalized.ok || supplyNormalized.ok;
  const inspection = accountNormalized.ok ? inspectMintAccount(accountNormalized.value) : null;
  const supply = supplyNormalized.ok ? supplyNormalized.value.value ?? null : null;

  return {
    version: POWERCHAIN_API_VERSION,
    mint,
    network: "solana" as const,
    cluster,
    state: heliusAvailable || rpcAvailable ? "READY" as const : "UNAVAILABLE" as const,
    source: heliusAvailable && rpcAvailable ? "helius-das+solana-rpc" as const : heliusAvailable ? "helius-das" as const : rpcAvailable ? "solana-rpc" as const : null,
    mintInspection: inspection,
    tokenSupply: supply ? {
      amountRaw: supply.amount ?? null,
      decimals: supply.decimals ?? inspection?.decimals ?? null,
      uiAmount: supply.uiAmount ?? null,
      uiAmountString: supply.uiAmountString ?? null,
      observedAtSlot: supplyNormalized.ok ? supplyNormalized.value.context?.slot ?? null : null,
    } : null,
    helius: heliusNormalized,
    rpc: {
      account: accountNormalized,
      supply: supplyNormalized,
    },
    observedAt: new Date().toISOString(),
  };
}

export async function getPowerChainOverview() {
  const pwrcMint = configuredPwrcMint();
  const [solana, market, programs] = await Promise.all([
    getSolanaOverview(),
    pwrcMint ? getSolanaMarket(pwrcMint).catch(() => null) : Promise.resolve(null),
    getPowerChainPrograms(),
  ]);
  const cct = cctDeploymentConfig(process.env);

  return {
    version: POWERCHAIN_API_VERSION,
    product: "PowerChain Digital Energy OS",
    state: solana.state === "UNAVAILABLE" ? "DEGRADED" as const : "READY" as const,
    authority: {
      physicalEnergy: "OFFCHAIN_VERIFIED_EVIDENCE",
      blockchain: "REPRESENTATION_SETTLEMENT_PROVENANCE",
      walletSigning: "EXTERNAL_USER_OR_SCOPED_EXECUTION_AUTHORITY",
    },
    networks: {
      solana: {
        cluster: solana.cluster,
        state: solana.state,
        rpc: solana.rpc,
        slot: solana.slot,
        blockHeight: solana.blockHeight,
        latestBlockhash: solana.latestBlockhash,
        version: solana.version,
      },
      sui: {
        network: process.env.NEXT_PUBLIC_SUI_NETWORK?.trim() || "devnet",
        state: "CONFIGURED_BY_ENVIRONMENT",
      },
    },
    tokens: {
      pwrc: {
        mint: pwrcMint,
        standard: "Token-2022",
        market,
      },
      cct: {
        ...CCT_TOKEN,
        deployment: cct,
      },
    },
    programs: {
      configured: programs.configured,
      verified: programs.verified,
      total: programs.total,
      launchpad: programs.launchpad,
    },
    observedAt: new Date().toISOString(),
  };
}

export function getTokenAllocations() {
  const raw = process.env.POWERCHAIN_PWRC_ALLOCATIONS_JSON?.trim();
  const base = {
    version: POWERCHAIN_API_VERSION,
    asset: "PWRC" as const,
    network: "solana" as const,
    standard: "Token-2022" as const,
    decimals: 9,
    transferFeeBps: 200,
    referencePriceUsd: "0.000002",
  };

  if (!raw) {
    return {
      ...base,
      state: "UNCONFIGURED" as const,
      allocations: [] as Array<{ id: string; label: string; percent: number; amountRaw?: string }>,
      totalPercent: 0,
      remainingPercent: 100,
      configuration: "POWERCHAIN_PWRC_ALLOCATIONS_JSON",
      note: "No token allocation percentages are fabricated when the canonical allocation policy is not configured.",
      observedAt: new Date().toISOString(),
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw Object.assign(new Error("POWERCHAIN_PWRC_ALLOCATIONS_JSON is not valid JSON"), {
      code: "PWRC_ALLOCATIONS_INVALID",
      status: 500,
    });
  }

  if (!Array.isArray(parsed)) {
    throw Object.assign(new Error("POWERCHAIN_PWRC_ALLOCATIONS_JSON must be a JSON array"), {
      code: "PWRC_ALLOCATIONS_INVALID",
      status: 500,
    });
  }

  const allocations = parsed.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw Object.assign(new Error(`PWRC allocation at index ${index} must be an object`), { code: "PWRC_ALLOCATIONS_INVALID", status: 500 });
    }
    const source = item as Record<string, unknown>;
    const id = String(source.id ?? "").trim();
    const label = String(source.label ?? source.name ?? "").trim();
    const percent = Number(source.percent);
    const amountRaw = source.amountRaw == null ? undefined : String(source.amountRaw).trim();
    if (!id || !label || !Number.isFinite(percent) || percent < 0 || percent > 100) {
      throw Object.assign(new Error(`PWRC allocation at index ${index} is invalid`), { code: "PWRC_ALLOCATIONS_INVALID", status: 500 });
    }
    if (amountRaw && !/^\d+$/.test(amountRaw)) {
      throw Object.assign(new Error(`PWRC allocation amountRaw at index ${index} must be an unsigned integer string`), { code: "PWRC_ALLOCATIONS_INVALID", status: 500 });
    }
    return { id, label, percent, ...(amountRaw ? { amountRaw } : {}) };
  });

  const totalPercent = allocations.reduce((sum, item) => sum + item.percent, 0);
  if (totalPercent > 100.000001) {
    throw Object.assign(new Error("PWRC allocation percentages exceed 100%"), { code: "PWRC_ALLOCATIONS_INVALID", status: 500 });
  }

  return {
    ...base,
    state: Math.abs(totalPercent - 100) < 0.000001 ? "READY" as const : "PARTIAL" as const,
    allocations,
    totalPercent,
    remainingPercent: Math.max(0, 100 - totalPercent),
    observedAt: new Date().toISOString(),
  };
}

export function getPublicPowerChainConfig() {
  const cluster = currentSolanaCluster();
  const powerchainPrograms = configuredProgramSummary();
  return {
    version: POWERCHAIN_API_VERSION,
    product: "PowerChain Digital Energy OS",
    apiVersion: "v1",
    environment: process.env.NODE_ENV ?? "development",
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.trim() || null,
    networks: {
      solana: {
        cluster,
        rpcConfigured: solanaRpcSource().configured,
        powerchainProgramConfigured: powerchainPrograms.some((program) => Boolean(program.programId)),
      },
      sui: {
        network: process.env.NEXT_PUBLIC_SUI_NETWORK?.trim() || "devnet",
      },
    },
    assets: {
      pwrc: {
        mint: configuredPwrcMint(),
        decimals: 9,
        standard: "Token-2022",
        transferFeeBps: 200,
      },
      cct: {
        programId: process.env.POWERCHAIN_CCT_PROGRAM_ID?.trim() || null,
        mint: process.env.NEXT_PUBLIC_CCT_MINT?.trim() || process.env.NEXT_PUBLIC_CRT_MINT?.trim() || null,
        standard: "Token-2022",
      },
    },
    features: {
      ai: process.env.NEXT_PUBLIC_AI_ENABLED !== "false",
      helius: Boolean(process.env.HELIUS_API_KEY?.trim() || process.env.HELIUS_RPC_URL?.trim()),
      database: Boolean(process.env.DATABASE_URL?.trim()),
      localEnergy: true,
      energyNetwork: true,
      tokenization: true,
    },
    docs: {
      swagger: "/api/swagger/",
      openapiJson: "/api/v1/openapi.json",
      openapiYaml: "/api/v1/openapi.yaml",
      postman: "/api/postman",
    },
    observedAt: new Date().toISOString(),
  };
}
