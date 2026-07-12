import { cookies } from "next/headers";
const COOKIE="qingtian_device";
export async function getDeviceId(){const store=await cookies();let id=store.get(COOKIE)?.value;if(!id||!id.startsWith("device:")){id=`device:${crypto.randomUUID()}`;store.set(COOKIE,id,{httpOnly:true,sameSite:"lax",secure:true,path:"/",maxAge:60*60*24*365*5})}return id}
