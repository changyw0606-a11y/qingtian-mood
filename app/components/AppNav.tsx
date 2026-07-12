"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function AppNav(){const path=usePathname();return <nav className="app-nav" aria-label="主要导航"><Link className={path==="/"?"active":""} href="/"><span>✍️</span>记录</Link><Link className={path.startsWith("/calendar")||path.startsWith("/day/")?"active":""} href="/calendar"><span>🗓️</span>日历</Link><Link className={path.startsWith("/settings")?"active":""} href="/settings"><span>☁️</span>数据</Link></nav>}
