module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/src/lib/security/security.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SESSION_COOKIE",
    ()=>SESSION_COOKIE,
    "SESSION_TTL_SECONDS",
    ()=>SESSION_TTL_SECONDS,
    "hashToken",
    ()=>hashToken,
    "randomToken",
    ()=>randomToken,
    "safeEqual",
    ()=>safeEqual,
    "sanitizeRedirect",
    ()=>sanitizeRedirect,
    "securityHeaders",
    ()=>securityHeaders
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const SESSION_COOKIE = "powerchain_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const securityHeaders = {
    "cache-control": "no-store, max-age=0",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin"
};
function randomToken(bytes = 32) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomBytes"])(bytes).toString("base64url");
}
function hashToken(value) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])("sha256").update(value).digest("hex");
}
function safeEqual(left, right) {
    const a = Buffer.from(left);
    const b = Buffer.from(right);
    return a.length === b.length && (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(a, b);
}
function sanitizeRedirect(value, fallback = "/") {
    return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}
}),
"[project]/src/lib/auth/sessions.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createSession",
    ()=>createSession,
    "destroySession",
    ()=>destroySession,
    "expiredSessionCookie",
    ()=>expiredSessionCookie,
    "getSession",
    ()=>getSession,
    "sessionCookie",
    ()=>sessionCookie
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/security/security.ts [app-route] (ecmascript)");
;
const sessions = new Map();
function createSession(user) {
    const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["randomToken"])();
    const issuedAt = new Date();
    const session = {
        id,
        user,
        issuedAt: issuedAt.toISOString(),
        expiresAt: new Date(issuedAt.getTime() + __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SESSION_TTL_SECONDS"] * 1000).toISOString()
    };
    sessions.set(id, session);
    return session;
}
function getSession(id) {
    if (!id) return null;
    const session = sessions.get(id);
    if (!session || Date.parse(session.expiresAt) <= Date.now()) {
        sessions.delete(id);
        return null;
    }
    return session;
}
function destroySession(id) {
    if (id) sessions.delete(id);
}
function sessionCookie(id) {
    return `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SESSION_COOKIE"]}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SESSION_TTL_SECONDS"]}${("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : ""}`;
}
function expiredSessionCookie() {
    return `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SESSION_COOKIE"]}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
}),
"[project]/src/app/api/v1/sessions/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.12_@babel+core@7.29.7_@playwright+test@1.62.1_react-dom@19.2.8_react@19.2.8/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$sessions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/sessions.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/security/security.ts [app-route] (ecmascript)");
;
;
;
async function GET() {
    const jar = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const session = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$sessions$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSession"])(jar.get(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SESSION_COOKIE"])?.value);
    return session ? Response.json({
        ok: true,
        data: session
    }, {
        headers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["securityHeaders"]
    }) : Response.json({
        ok: false,
        error: "Unauthenticated"
    }, {
        status: 401,
        headers: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2f$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["securityHeaders"]
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__166zb7o._.js.map