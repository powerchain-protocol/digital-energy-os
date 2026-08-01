import actions from "../actions.json";
import type { PlatformAction } from "@/types/actions";

export const platformActions = actions as PlatformAction[];
export const findAction = (id: string) => platformActions.find((action) => action.id === id);
