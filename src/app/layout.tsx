import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "杨凌国合跨境物流有限公司 - 集装箱租赁",
  description: "专业国际集装箱租赁服务，覆盖全球主要港口，40HQ/40HC多种箱型",
};

function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">🚢</span>
          <div>
            <div className="font-bold text-[#1E3A5F] text-lg leading-tight">杨凌国合跨境物流</div>
            <div className="text-xs text-[#64748B]">国际集装箱租赁</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="text-[#1E3A5F] hover:text-[#2563EB] font-medium transition">首页</Link>
          <Link href="/inventory" className="text-[#64748B] hover:text-[#2563EB] transition">库存查询</Link>
          <Link href="/quote" className="text-[#64748B] hover:text-[#2563EB] transition">询价</Link>
          <Link href="/auth/login" className="text-[#64748B] hover:text-[#2563EB] transition">登录</Link>
        </nav>
        <Link
          href="/quote"
          className="bg-[#F97316] hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
        >
          立即询价
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1E3A5F] text-blue-200 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        <p className="text-white font-medium">杨凌国合跨境物流有限公司</p>
        <p className="mt-2">© 2025 Yangling Guohe Cross-border Logistics. All rights reserved.</p>
        <p className="mt-1">联系方式: renqinjiang@ylghwl.cn</p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#1E293B]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}