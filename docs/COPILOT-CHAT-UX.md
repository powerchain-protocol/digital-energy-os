# PowerChain Copilot Chat UX v1.0.0

The canonical Copilot chat now combines encrypted persistent conversations, deterministic PWRC settlement and tokenized response proofs.

## Operator-visible financial state

Every settled assistant response may expose:

- `SETTLED` tokenized response proof state;
- `10,000 PWRC · 1 MSG UNIT`;
- receipt identifier and receipt hash;
- proof hash;
- explicit non-transferable / non-minted / non-financial-instrument semantics;
- proof verification without exposing model chain-of-thought or encryption secrets.

The Copilot header and settings surfaces include a `PWRC / Credits` shortcut. Conversation summaries report message units, spent base units, spent PWRC, tokenized response count and proof references.

## Failure behavior

Generation failure or cancellation releases held capacity. The UI must never show a tokenized proof until server settlement has completed atomically. HTTP `402` indicates insufficient PWRC chat credits; it is not reported as a model failure.
