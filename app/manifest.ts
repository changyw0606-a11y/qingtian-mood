import type { MetadataRoute } from "next";
export default function manifest():MetadataRoute.Manifest{return {name:"晴天 · 心情日记",short_name:"晴天",description:"记录每天的心情和随笔",start_url:"/record",display:"standalone",background_color:"#fffaf0",theme_color:"#ffc857",orientation:"portrait",icons:[{src:"/favicon.svg",sizes:"any",type:"image/svg+xml"}]}}
