export const concatBytes=(...a:Uint8Array[])=>new Uint8Array(a.flatMap(x=>[...x]));
