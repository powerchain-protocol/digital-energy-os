(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/data/metrics.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generation",
    ()=>generation
]);
const generation = [
    {
        day: "Mon",
        solar: 42,
        wind: 27
    },
    {
        day: "Tue",
        solar: 48,
        wind: 25
    },
    {
        day: "Wed",
        solar: 54,
        wind: 31
    },
    {
        day: "Thu",
        solar: 51,
        wind: 36
    },
    {
        day: "Fri",
        solar: 60,
        wind: 34
    },
    {
        day: "Sat",
        solar: 64,
        wind: 39
    },
    {
        day: "Sun",
        solar: 68,
        wind: 42
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/metrics-chart-client.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MetricsChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.12_@babel+core@7.29.7_@playwright+test@1.62.1_react-dom@19.2.8_react@19.2.8/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/recharts@3.10.1_@types+react@19.2.18_react-dom@19.2.8_react-is@17.0.2_react@19.2.8_redux@5.0.1/node_modules/recharts/es6/component/ResponsiveContainer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/recharts@3.10.1_@types+react@19.2.18_react-dom@19.2.8_react-is@17.0.2_react@19.2.8_redux@5.0.1/node_modules/recharts/es6/chart/AreaChart.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/recharts@3.10.1_@types+react@19.2.18_react-dom@19.2.8_react-is@17.0.2_react@19.2.8_redux@5.0.1/node_modules/recharts/es6/cartesian/Area.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/recharts@3.10.1_@types+react@19.2.18_react-dom@19.2.8_react-is@17.0.2_react@19.2.8_redux@5.0.1/node_modules/recharts/es6/cartesian/XAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/recharts@3.10.1_@types+react@19.2.18_react-dom@19.2.8_react-is@17.0.2_react@19.2.8_redux@5.0.1/node_modules/recharts/es6/cartesian/YAxis.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/recharts@3.10.1_@types+react@19.2.18_react-dom@19.2.8_react-is@17.0.2_react@19.2.8_redux@5.0.1/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/recharts@3.10.1_@types+react@19.2.18_react-dom@19.2.8_react-is@17.0.2_react@19.2.8_redux@5.0.1/node_modules/recharts/es6/component/Tooltip.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/recharts@3.10.1_@types+react@19.2.18_react-dom@19.2.8_react-is@17.0.2_react@19.2.8_redux@5.0.1/node_modules/recharts/es6/component/Legend.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$metrics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/metrics.ts [app-client] (ecmascript)");
"use client";
;
;
;
function MetricsChart() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-72",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ResponsiveContainer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ResponsiveContainer"], {
            width: "100%",
            height: "100%",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$chart$2f$AreaChart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AreaChart"], {
                data: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$metrics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generation"],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("defs", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("linearGradient", {
                            id: "g",
                            x1: "0",
                            y1: "0",
                            x2: "0",
                            y2: "1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                    offset: "5%",
                                    stopColor: "#0F5A46",
                                    stopOpacity: .35
                                }, void 0, false, {
                                    fileName: "[project]/src/components/metrics-chart-client.tsx",
                                    lineNumber: 2,
                                    columnNumber: 340
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("stop", {
                                    offset: "95%",
                                    stopColor: "#0F5A46",
                                    stopOpacity: 0
                                }, void 0, false, {
                                    fileName: "[project]/src/components/metrics-chart-client.tsx",
                                    lineNumber: 2,
                                    columnNumber: 397
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/metrics-chart-client.tsx",
                            lineNumber: 2,
                            columnNumber: 289
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/metrics-chart-client.tsx",
                        lineNumber: 2,
                        columnNumber: 283
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianGrid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CartesianGrid"], {
                        strokeDasharray: "3 3",
                        opacity: .2
                    }, void 0, false, {
                        fileName: "[project]/src/components/metrics-chart-client.tsx",
                        lineNumber: 2,
                        columnNumber: 477
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$XAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["XAxis"], {
                        dataKey: "day"
                    }, void 0, false, {
                        fileName: "[project]/src/components/metrics-chart-client.tsx",
                        lineNumber: 2,
                        columnNumber: 528
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$YAxis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["YAxis"], {}, void 0, false, {
                        fileName: "[project]/src/components/metrics-chart-client.tsx",
                        lineNumber: 2,
                        columnNumber: 550
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Tooltip$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tooltip"], {}, void 0, false, {
                        fileName: "[project]/src/components/metrics-chart-client.tsx",
                        lineNumber: 2,
                        columnNumber: 558
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Legend$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Legend"], {}, void 0, false, {
                        fileName: "[project]/src/components/metrics-chart-client.tsx",
                        lineNumber: 2,
                        columnNumber: 568
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Area"], {
                        type: "monotone",
                        dataKey: "solar",
                        stroke: "#0F5A46",
                        fill: "url(#g)"
                    }, void 0, false, {
                        fileName: "[project]/src/components/metrics-chart-client.tsx",
                        lineNumber: 2,
                        columnNumber: 577
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$12_$40$babel$2b$core$40$7$2e$29$2e$7_$40$playwright$2b$test$40$1$2e$62$2e$1_react$2d$dom$40$19$2e$2$2e$8_react$40$19$2e$2$2e$8$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$recharts$40$3$2e$10$2e$1_$40$types$2b$react$40$19$2e$2$2e$18_react$2d$dom$40$19$2e$2$2e$8_react$2d$is$40$17$2e$0$2e$2_react$40$19$2e$2$2e$8_redux$40$5$2e$0$2e$1$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$Area$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Area"], {
                        type: "monotone",
                        dataKey: "wind",
                        stroke: "#38bdf8",
                        fillOpacity: 0
                    }, void 0, false, {
                        fileName: "[project]/src/components/metrics-chart-client.tsx",
                        lineNumber: 2,
                        columnNumber: 648
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/metrics-chart-client.tsx",
                lineNumber: 2,
                columnNumber: 254
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/metrics-chart-client.tsx",
            lineNumber: 2,
            columnNumber: 206
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/metrics-chart-client.tsx",
        lineNumber: 2,
        columnNumber: 184
    }, this);
}
_c = MetricsChart;
var _c;
__turbopack_context__.k.register(_c, "MetricsChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/metrics-chart-client.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/metrics-chart-client.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_0pvx6zc._.js.map