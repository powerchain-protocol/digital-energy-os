export const CCT_PROGRAM_VERSION="1.0.0" as const;
export const CCT_PROGRAM_ID_ENV="POWERCHAIN_CCT_PROGRAM_ID" as const;
export const CCT_MINT_ENV="POWERCHAIN_CCT_MINT" as const;
export function cctProgramConfig(env:Record<string,string|undefined>){const programId=env[CCT_PROGRAM_ID_ENV]?.trim()||null;const mint=env[CCT_MINT_ENV]?.trim()||null;return{programId,mint,ready:Boolean(programId&&mint),standard:"TOKEN_2022" as const}}
