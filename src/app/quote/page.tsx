"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const CONTAINER_TYPES = [
  { value: "40HQ", label: "40HQ (高箱)" },
  { value: "40HC", label: "40HC (高箱)" },
  { value: "40GP", label: "40GP (标准)" },
  { value: "20GP", label: "20GP (小箱)" },
  { value: "45HC", label: "45HC (超大)" },
];

export default function QuotePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quoteNo, setQuoteNo] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    origin: "",
    destination: "",
    container_type: "40HQ",
    quantity: 1,
    lease_days: 30,
    estimated_date: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    remarks: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 提交询价单
      const { data, error: submitError } = await supabase
        .from("quotes")
        .insert({
          origin: form.origin,
          destination: form.destination,
          container_type: form.container_type,
          quantity: parseInt(form.quantity as unknown as string),
          lease_days: parseInt(form.lease_days as unknown as string),
          estimated_date: form.estimated_date || null,
          contact_name: form.contact_name,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone || null,
          remarks: form.remarks || null,
        })
        .select("quote_no")
        .single();

      if (submitError) throw submitError;

      // 发送邮件通知（通过 Supabase Edge Function）
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "new_quote",
            quote_no: data.quote_no,
            contact_email: form.contact_email,
            contact_name: form.contact_name,
            origin: form.origin,
            destination: form.destination,
            container_type: form.container_type,
            quantity: form.quantity,
            lease_days: form.lease_days,
          }),
        });
      } catch (emailError) {
        // 邮件发送失败不影响主流程
        console.error("Email notification failed:", emailError);
      }

      setQuoteNo(data.quote_no);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("提交失败，请稍后重试或联系管理员");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-2xl font-bold mb-2">询价单已提交</h1>
        <p className="text-[#64748B] mb-4">
          感谢您的询价，我们的团队将在24小时内处理
        </p>
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="text-sm text-[#64748B] mb-1">询价单号</div>
          <div className="text-2xl font-mono font-bold text-[#2563EB]">{quoteNo}</div>
        </div>
        <p className="text-sm text-[#64748B] mb-6">
          确认邮件已发送至 <span className="font-medium">{form.contact_email}</span>
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="bg-[#1E3A5F] hover:bg-[#2563EB] text-white px-6 py-3 rounded-lg font-medium transition"
          >
            返回首页
          </Link>
          <Link
            href="/quote"
            className="text-[#2563EB] hover:underline text-sm"
            onClick={() => {
              setSuccess(false);
              setForm({
                origin: "",
                destination: "",
                container_type: "40HQ",
                quantity: 1,
                lease_days: 30,
                estimated_date: "",
                contact_name: "",
                contact_email: "",
                contact_phone: "",
                remarks: "",
              });
            }}
          >
            提交新的询价
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">提交询价</h1>
        <p className="text-[#64748B]">填写您的租赁需求，我们将在24小时内报价</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* 起运地 / 目的港 */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              起运地 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="origin"
              value={form.origin}
              onChange={handleChange}
              required
              placeholder="如：上海港"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              目的港 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="destination"
              value={form.destination}
              onChange={handleChange}
              required
              placeholder="如：洛杉矶港"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
        </div>

        {/* 箱型 / 箱量 */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              箱型 <span className="text-red-500">*</span>
            </label>
            <select
              name="container_type"
              value={form.container_type}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            >
              {CONTAINER_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              箱量 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              min="1"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
        </div>

        {/* 租期 / 预计用箱时间 */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              租期（天）<span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="lease_days"
              value={form.lease_days}
              onChange={handleChange}
              required
              min="1"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">预计用箱时间</label>
            <input
              type="date"
              name="estimated_date"
              value={form.estimated_date}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
        </div>

        {/* 联系人信息 */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              联系人 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="contact_name"
              value={form.contact_name}
              onChange={handleChange}
              required
              placeholder="您的姓名"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              邮箱 <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="contact_email"
              value={form.contact_email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
        </div>

        {/* 电话 */}
        <div>
          <label className="block text-sm font-medium mb-2">电话</label>
          <input
            type="tel"
            name="contact_phone"
            value={form.contact_phone}
            onChange={handleChange}
            placeholder="+86 xxx xxxx xxxx"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
          />
        </div>

        {/* 备注 */}
        <div>
          <label className="block text-sm font-medium mb-2">备注</label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            rows={3}
            placeholder="其他要求或补充说明..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#F97316] hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition"
        >
          {loading ? "提交中..." : "提交询价"}
        </button>
      </form>
    </div>
  );
}
