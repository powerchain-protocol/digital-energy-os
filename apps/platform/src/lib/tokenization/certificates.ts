export function certificateId(kind:"REC"|"CCT",origin:string,vintage:number,serial:number){return kind+"-"+origin.toUpperCase()+"-"+vintage+"-"+String(serial).padStart(8,"0")}
