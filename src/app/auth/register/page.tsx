"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    company: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          company: form.company,
          phone: form.phone,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">📧</div>
        <h1 className="text-2xl font-bold mb-2">验证邮件已发送</h1>
        <p className="text-[#64748B] mb-6">
          我们已向 <span className="font-medium">{form.email}</span> 发送了一封验证邮件，
          请点击邮件中的链接完成注册。
        </p>
        <Link
          href="/auth/login"
          className="text-[#2563EB] hover:underline text-sm"
        >
          返回登录
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">👤</div>
        <h1 className="text-2xl font-bold">注册账号</h1>
        <p className="text-[#64748B] mt-1">创建账号，开始使用平台服务</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            邮箱 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            密码 <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            placeholder="至少6位"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">公司名称</label>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="您的公司名称"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">电话</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+86 xxx xxxx xxxx"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition"
        >
          {loading ? "注册中..." : "注册"}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-[#64748B]">
        已有账号？{" "}
        <Link href="/auth/login" className="text-[#2563EB] hover:underline">
          立即登录
        </Link>
      </p>
    </div>
  );
}
