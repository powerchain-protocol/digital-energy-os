import{NextResponse}from"next/server";import{POWERCHAIN_AGENTS}from"@/data/ai-agents";export async function GET(){return NextResponse.json({data:POWERCHAIN_AGENTS})}
