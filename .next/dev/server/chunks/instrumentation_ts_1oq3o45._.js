module.exports = [
"[project]/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Optional Next.js instrumentation hook.
 *
 * This entry point is intentionally dependency-free. Provider-specific tracing
 * is initialized from server-only runtime modules after application startup.
 */ __turbopack_context__.s([
    "register",
    ()=>register
]);
async function register() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    if (process.env.OTEL_ENABLED === "true") {
        console.info("[PowerChain] Observability hooks enabled.");
    }
}
}),
];

//# sourceMappingURL=instrumentation_ts_1oq3o45._.js.map