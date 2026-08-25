"use client";
import { createContext,useContext,useEffect,useMemo,type ReactNode } from "react";
export interface CopilotPageContext{page:string;resourceType?:string;resourceId?:string;label?:string;metadata?:Record<string,string|number|boolean|null>}
const KEY="powerchain:copilot:page-context:v1";
const Context=createContext<CopilotPageContext|null>(null);
export function CopilotContextProvider({value,children}:{value:CopilotPageContext;children:ReactNode}){useEffect(()=>{try{sessionStorage.setItem(KEY,JSON.stringify(value))}catch{}},[value]);return <Context.Provider value={value}>{children}</Context.Provider>}
export function useCopilotPageContext(){return useContext(Context)}
export function readStoredCopilotContext():CopilotPageContext|null{if(typeof window==="undefined")return null;try{return JSON.parse(sessionStorage.getItem(KEY)??"null") as CopilotPageContext|null}catch{return null}}
