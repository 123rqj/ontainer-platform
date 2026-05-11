import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "毅联国际 - 集装箱租赁平台",
  description: "专业国际集装箱租赁服务，覆盖全球主要港口",
};

function Header() {
  return (
    <header className="bg-[#1E3A5F] text-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-2xl">🚢</span>
          <div>
            <div className="font-bold text-lg">毅联国际</div>
            <div className="text-xs text-blue-200">集装箱租赁平台</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-blue-200 transition">首页</Link>
          <Link href="/inventory" className="hover:text-blue-200 transition">库存查询</Link>
          <Link href="/quote" className="hover:text-blue-200 transition">询价</Link>
          <Link href="/auth/login" className="hover:text-blue-200 transition">登录</Link>
        </nav>
        <Link
          href="/quote"
          className="bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
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
        <p>© 2025 毅联国际 Container Leasing. All rights reserved.</p>
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
    <html lang="zh-CN" className={inter.variable}>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#1E293B]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
