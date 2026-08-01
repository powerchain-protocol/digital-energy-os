import type { ApiErrorPayload, ErrorCode, ErrorDetails } from "@/types/errors";

export class PowerChainError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode = "INTERNAL_ERROR",
    public readonly status = 500,
    public readonly details?: ErrorDetails,
  ) { super(message); this.name = "PowerChainError"; }
}

export function toPowerChainError(error: unknown): PowerChainError {
  if (error instanceof PowerChainError) return error;
  return new PowerChainError(error instanceof Error ? error.message : "Unexpected platform error");
}

export function errorPayload(error: unknown, requestId?: string): ApiErrorPayload {
  const normalized = toPowerChainError(error);
  return { error: { code: normalized.code, message: normalized.message, requestId, details: normalized.details } };
}
