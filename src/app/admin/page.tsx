"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const ADMIN_PASSWORD = "ylghwl2025";

type Container = {
  id: string;
  container_no: string;
  type: string;
  status: string;
  location: string;
  current_order_id?: string;
};

type Quote = {
  id: string;
  quote_no: string;
  origin: string;
  destination: string;
  container_type: string;
  quantity: number;
  lease_days: number;
  status: string;
  contact_name: string;
  contact_email: string;
  created_at: string;
};

type Order = {
  id: string;
  order_no: string;
  origin: string;
  destination: string;
  container_type: string;
  quantity: number;
  rent_usd: number;
  status: string;
  created_at: string;
};

const statusMap: Record<string, { label: string; bg: string; text: string }> = {
  available: { label: "可用", bg: "bg-emerald-50", text: "text-emerald-600" },
  reserved: { label: "已预订", bg: "bg-amber-50", text: "text-amber-600" },
  "in-use": { label: "在租", bg: "bg-violet-50", text: "text-violet-600" },
  maintenance: { label: "维修", bg: "bg-red-50", text: "text-red-600" },
  pending: { label: "待报价", bg: "bg-amber-50", text: "text-amber-600" },
  quoted: { label: "已报价", bg: "bg-blue-50", text: "text-blue-600" },
  confirmed: { label: "已确认", bg: "bg-emerald-50", text: "text-emerald-600" },
  cancelled: { label: "已取消", bg: "bg-gray-100", text: "text-gray-500" },
  returned: { label: "已归还", bg: "bg-gray-100", text: "text-gray-500" },
  completed: { label: "已完成", bg: "bg-gray-100", text: "text-gray-500" },
};

const containerTypes = ["40HQ", "40HC", "40GP", "20GP", "45HC"];
const locations = ["上海港", "青岛港", "宁波港", "深圳港", "天津港", "厦门港", "大连港", "广州港"];
const containerStatuses = ["available", "reserved", "in-use", "maintenance"];

export default function AdminDashboard() {
  const supabase = createClient();
  const [loggedIn, setLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [containers, setContainers] = useState<Container[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);
  const [editForm, setEditForm] = useState({ status: "", location: "", type: "" });
  const [tab, setTab] = useState<"overview" | "containers" | "quotes" | "orders">("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ container_no: "", type: "40HQ", status: "available", location: "上海港" });

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_logged_in");
    if (saved === "true") setLoggedIn(true);
  }, []);

  async function handleLogin() {
    if (passwordInput === ADMIN_PASSWORD) {
      setLoggedIn(true);
      sessionStorage.setItem("admin_logged_in", "true");
      setLoginError(false);
      loadData();
    } else {
      setLoginError(true);
      setPasswordInput("");
    }
  }

  function handleLogout() {
    setLoggedIn(false);
    sessionStorage.removeItem("admin_logged_in");
  }

  useEffect(() => { if (loggedIn) loadData(); }, [loggedIn]);

  async function loadData() {
    setLoading(true);
    const [cRes, qRes, oRes] = await Promise.all([
      supabase.from("containers").select("*").order("container_no"),
      supabase.from("quotes").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    if (cRes.data) setContainers(cRes.data);
    if (qRes.data) setQuotes(qRes.data);
    if (oRes.data) setOrders(oRes.data);
    setLoading(false);
  }

  async function updateContainer(id: string, updates: Partial<Container>) {
    const { error } = await supabase.from("containers").update(updates).eq("id", id);
    if (!error) setContainers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    setEditingContainer(null);
  }

  async function addContainer() {
    if (!addForm.container_no.trim()) return;
    const { data, error } = await supabase.from("containers").insert({
      container_no: addForm.container_no.trim().toUpperCase(),
      type: addForm.type, status: addForm.status, location: addForm.location,
    }).select().single();
    if (!error && data) { setContainers(prev => [...prev, data]); setShowAddModal(false); setAddForm({ container_no: "", type: "40HQ", status: "available", location: "上海港" }); }
  }

  async function deleteContainer(id: string) {
    if (!confirm("确认删除此箱号？")) return;
    const { error } = await supabase.from("containers").delete().eq("id", id);
    if (!error) setContainers(prev => prev.filter(c => c.id !== id));
  }

  const total = containers.length;
  const available = containers.filter(c => c.status === "available").length;
  const inUse = containers.filter(c => c.status === "in-use").length;
  const reserved = containers.filter(c => c.status === "reserved").length;
  const maintenance = containers.filter(c => c.status === "maintenance").length;
  const pendingQuotes = quotes.filter(q => q.status === "pending").length;
  const activeOrders = orders.filter(o => ["confirmed", "in-use"].includes(o.status)).length;
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length;
  const weekOrders = orders.filter(o => { const d = new Date(o.created_at); const diff = (new Date().getTime() - d.getTime()) / (1000 * 60 * 60 * 24); return diff <= 7; }).length;
  const typeStats: Record<string, number> = {};
  for (const c of containers) typeStats[c.type] = (typeStats[c.type] || 0) + 1;
  const locationStats: Record<string, number> = {};
  for (const c of containers) locationStats[c.location] = (locationStats[c.location] || 0) + 1;

  const statusLabel = (s: string) => statusMap[s]?.label || s;
  const statusColor = (s: string) => statusMap[s] || { bg: "bg-gray-50", text: "text-gray-500" };

  function startEdit(c: Container) { setEditingContainer(c); setEditForm({ status: c.status, location: c.location, type: c.type }); }

  // Login screen
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="bg-[#1E293B] rounded-2xl p-8 w-full max-w-sm border border-white/10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🚢</div>
            <h1 className="text-2xl font-bold text-white">杨凌国合</h1>
            <p className="text-slate-400 text-sm mt-1">管理后台</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">输入管理员密码</label>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="请输入密码..."
                className={`w-full bg-slate-800 border ${loginError ? "border-red-500" : "border-white/20"} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500`}
              />
              {loginError && <p className="text-red-400 text-sm mt-2">密码错误，请重试</p>}
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition"
            >
              进入后台
            </button>
          </div>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition">← 返回首页</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="bg-[#1E293B] border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div><h1 className="text-xl font-bold flex items-center gap-2"><span className="text-2xl">🚢</span> 杨凌国合集装箱租赁</h1><p className="text-blue-300 text-xs mt-0.5">管理后台 · 内部使用</p></div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-blue-300 hover:text-white transition">返回首页</Link>
          <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-white transition border border-white/20 px-3 py-1 rounded-lg">退出登录</button>
          <div className="text-xs text-slate-400">{new Date().toLocaleDateString("zh-CN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] rounded-2xl p-5"><div className="text-blue-200 text-xs font-medium mb-1">总箱量</div><div className="text-4xl font-bold">{total}</div><div className="text-blue-300 text-xs mt-1">全部箱号</div></div>
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-5"><div className="text-emerald-200 text-xs font-medium mb-1">可用箱</div><div className="text-4xl font-bold">{available}</div><div className="text-emerald-200 text-xs mt-1">可立即租用</div></div>
          <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-5"><div className="text-violet-200 text-xs font-medium mb-1">在租箱</div><div className="text-4xl font-bold">{inUse}</div><div className="text-violet-200 text-xs mt-1">使用中</div></div>
          <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl p-5"><div className="text-amber-200 text-xs font-medium mb-1">已预订</div><div className="text-4xl font-bold">{reserved}</div><div className="text-amber-200 text-xs mt-1">待起运</div></div>
          <div className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-2xl p-5"><div className="text-rose-200 text-xs font-medium mb-1">维修中</div><div className="text-4xl font-bold">{maintenance}</div><div className="text-rose-200 text-xs mt-1">维护/检修</div></div>
          <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl p-5"><div className="text-orange-200 text-xs font-medium mb-1">待处理询价</div><div className="text-4xl font-bold">{pendingQuotes}</div><div className="text-orange-200 text-xs mt-1">需报价</div></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/10"><div className="text-slate-400 text-xs mb-1">今日新订单</div><div className="text-3xl font-bold text-emerald-400">{todayOrders}</div></div>
          <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/10"><div className="text-slate-400 text-xs mb-1">本周订单</div><div className="text-3xl font-bold text-blue-400">{weekOrders}</div></div>
          <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/10"><div className="text-slate-400 text-xs mb-1">活跃订单</div><div className="text-3xl font-bold text-violet-400">{activeOrders}</div></div>
          <div className="bg-[#1E293B] rounded-2xl p-4 border border-white/10"><div className="text-slate-400 text-xs mb-1">总询价单</div><div className="text-3xl font-bold text-amber-400">{quotes.length}</div></div>
        </div>
        <div className="flex gap-2 mb-6">
          {([["overview","总览"],["containers","箱号管理"],["quotes","询价单"],["orders","订单"]] as const).map(([t,label]) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${tab === t ? "bg-[#2563EB] text-white" : "bg-[#1E293B] text-slate-400 hover:text-white border border-white/10"}`}>{label}</button>
          ))}
        </div>
        {tab === "overview" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-4">📦 箱型分布</h3>
              <div className="space-y-3">{Object.entries(typeStats).sort((a,b) => b[1]-a[1]).map(([type,count]) => (
                <div key={type} className="flex items-center gap-4"><div className="w-20 text-sm font-medium text-slate-300">{type}</div><div className="flex-1 bg-slate-700 rounded-full h-6 overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-end pr-2" style={{ width: `${total > 0 ? (count/total*100) : 0}%` }}><span className="text-xs font-bold text-white">{count}</span></div></div></div>
              ))}{Object.keys(typeStats).length === 0 && <p className="text-slate-500 text-sm">暂无数据</p>}</div>
            </div>
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-4">📍 港口分布</h3>
              <div className="grid grid-cols-2 gap-3">{Object.entries(locationStats).sort((a,b) => b[1]-a[1]).map(([loc,count]) => (
                <div key={loc} className="bg-slate-800 rounded-xl p-3 flex items-center justify-between"><span className="text-sm text-slate-300">{loc}</span><span className="text-lg font-bold text-cyan-400">{count}</span></div>
              ))}{Object.keys(locationStats).length === 0 && <p className="text-slate-500 text-sm col-span-2">暂无数据</p>}</div>
            </div>
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-4">📋 最新询价</h3>
              <div className="space-y-2">{quotes.slice(0,5).map(q => (
                <div key={q.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div><div className="text-sm font-mono text-blue-400">{q.quote_no}</div><div className="text-xs text-slate-400">{q.origin} → {q.destination}</div></div>
                  <div className="text-right"><span className={`text-xs px-2 py-1 rounded-full ${statusColor(q.status).bg} ${statusColor(q.status).text}`}>{statusLabel(q.status)}</span><div className="text-xs text-slate-500 mt-1">{new Date(q.created_at).toLocaleDateString("zh-CN")}</div></div>
                </div>
              ))}{quotes.length === 0 && <p className="text-slate-500 text-sm">暂无询价</p>}</div>
            </div>
            <div className="bg-[#1E293B] rounded-2xl p-6 border border-white/10">
              <h3 className="font-semibold text-lg mb-4">📦 订单状态</h3>
              <div className="space-y-2">{orders.slice(0,5).map(o => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div><div className="text-sm font-mono text-emerald-400">{o.order_no}</div><div className="text-xs text-slate-400">{o.container_type} × {o.quantity} · {o.origin} → {o.destination}</div></div>
                  <div className="text-right"><span className={`text-xs px-2 py-1 rounded-full ${statusColor(o.status).bg} ${statusColor(o.status).text}`}>{statusLabel(o.status)}</span><div className="text-xs text-slate-500 mt-1">${o.rent_usd}</div></div>
                </div>
              ))}{orders.length === 0 && <p className="text-slate-500 text-sm">暂无订单</p>}</div>
            </div>
          </div>
        )}
        {tab === "containers" && (
          <div>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold">箱号管理</h3><button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">+ 添加箱号</button></div>
            <div className="bg-[#1E293B] rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm"><thead><tr className="bg-slate-800 text-slate-400 text-left"><th className="px-4 py-3 font-medium">箱号</th><th className="px-4 py-3 font-medium">箱型</th><th className="px-4 py-3 font-medium">状态</th><th className="px-4 py-3 font-medium">位置</th><th className="px-4 py-3 font-medium">关联订单</th><th className="px-4 py-3 font-medium">操作</th></tr></thead>
              <tbody className="divide-y divide-white/5">{containers.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-cyan-400">{c.container_no}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${statusColor(c.status).bg} ${statusColor(c.status).text}`}>{statusLabel(c.status)}</span></td>
                  <td className="px-4 py-3 text-slate-400">{c.location}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{c.current_order_id || "-"}</td>
                  <td className="px-4 py-3"><button onClick={() => startEdit(c)} className="text-blue-400 hover:text-blue-300 text-xs mr-3">编辑</button><button onClick={() => deleteContainer(c.id)} className="text-red-400 hover:text-red-300 text-xs">删除</button></td>
                </tr>
              ))}</tbody>
              </table>{containers.length === 0 && <div className="p-8 text-center text-slate-500">暂无箱号数据</div>}
            </div>
          </div>
        )}
        {tab === "quotes" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">询价单</h3>
            <div className="bg-[#1E293B] rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm"><thead><tr className="bg-slate-800 text-slate-400 text-left"><th className="px-4 py-3 font-medium">单号</th><th className="px-4 py-3 font-medium">路线</th><th className="px-4 py-3 font-medium">箱型/量</th><th className="px-4 py-3 font-medium">租期</th><th className="px-4 py-3 font-medium">联系人</th><th className="px-4 py-3 font-medium">状态</th><th className="px-4 py-3 font-medium">时间</th></tr></thead>
              <tbody className="divide-y divide-white/5">{quotes.map(q => (
                <tr key={q.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-blue-400">{q.quote_no}</td>
                  <td className="px-4 py-3">{q.origin} → {q.destination}</td>
                  <td className="px-4 py-3">{q.container_type} × {q.quantity}</td>
                  <td className="px-4 py-3">{q.lease_days}天</td>
                  <td className="px-4 py-3"><div className="font-medium text-white text-xs">{q.contact_name}</div><div className="text-slate-500 text-xs">{q.contact_email}</div></td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${statusColor(q.status).bg} ${statusColor(q.status).text}`}>{statusLabel(q.status)}</span></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(q.created_at).toLocaleDateString("zh-CN")}</td>
                </tr>
              ))}</tbody>
              </table>{quotes.length === 0 && <div className="p-8 text-center text-slate-500">暂无询价单</div>}
            </div>
          </div>
        )}
        {tab === "orders" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">订单管理</h3>
            <div className="bg-[#1E293B] rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm"><thead><tr className="bg-slate-800 text-slate-400 text-left"><th className="px-4 py-3 font-medium">订单号</th><th className="px-4 py-3 font-medium">路线</th><th className="px-4 py-3 font-medium">箱型/量</th><th className="px-4 py-3 font-medium">租金(USD)</th><th className="px-4 py-3 font-medium">状态</th><th className="px-4 py-3 font-medium">时间</th></tr></thead>
              <tbody className="divide-y divide-white/5">{orders.map(o => (
                <tr key={o.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono text-emerald-400">{o.order_no}</td>
                  <td className="px-4 py-3">{o.origin} → {o.destination}</td>
                  <td className="px-4 py-3">{o.container_type} × {o.quantity}</td>
                  <td className="px-4 py-3 text-emerald-400">${o.rent_usd}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${statusColor(o.status).bg} ${statusColor(o.status).text}`}>{statusLabel(o.status)}</span></td>
                  <td className="px-4 py-3 text-slate-500">{new Date(o.created_at).toLocaleDateString("zh-CN")}</td>
                </tr>
              ))}</tbody>
              </table>{orders.length === 0 && <div className="p-8 text-center text-slate-500">暂无订单</div>}
            </div>
          </div>
        )}
      </div>
      {editingContainer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-lg font-semibold mb-5">编辑箱号 — {editingContainer.container_no}</h3>
            <div className="space-y-4">
              <div><label className="block text-xs text-slate-400 mb-1">箱型</label><select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-slate-800 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500">{containerTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="block text-xs text-slate-400 mb-1">状态</label><select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-slate-800 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500">{containerStatuses.map(s => <option key={s} value={s}>{statusMap[s].label}</option>)}</select></div>
              <div><label className="block text-xs text-slate-400 mb-1">位置</label><select value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} className="w-full bg-slate-800 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500">{locations.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={() => updateContainer(editingContainer.id, editForm)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition">保存</button><button onClick={() => setEditingContainer(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium transition">取消</button></div>
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-lg font-semibold mb-5">添加新箱号</h3>
            <div className="space-y-4">
              <div><label className="block text-xs text-slate-400 mb-1">箱号 *</label><input type="text" value={addForm.container_no} onChange={e => setAddForm(f => ({ ...f, container_no: e.target.value }))} placeholder="如：MSKU1234567" className="w-full bg-slate-800 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 uppercase" /></div>
              <div><label className="block text-xs text-slate-400 mb-1">箱型</label><select value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-slate-800 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500">{containerTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="block text-xs text-slate-400 mb-1">状态</label><select value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-slate-800 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500">{containerStatuses.map(s => <option key={s} value={s}>{statusMap[s].label}</option>)}</select></div>
              <div><label className="block text-xs text-slate-400 mb-1">位置</label><select value={addForm.location} onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))} className="w-full bg-slate-800 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500">{locations.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={addContainer} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition">添加</button><button onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium transition">取消</button></div>
          </div>
        </div>
      )}
    </div>
  );
}