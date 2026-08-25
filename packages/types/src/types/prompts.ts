export type PromptCategory="operations"|"assets"|"energy"|"treasury"|"alerts"|"reports"|"risk"|"tokenization"|"renewables"|"grid"|"trading"|"maintenance"|"carbon";
export type SavedPrompt={id:string;title:string;description:string;prompt:string;category:PromptCategory;tags:string[];createdAt:string;updatedAt:string;system?:boolean};
