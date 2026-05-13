"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

type Container = {
  id: string;
  container_no: string;
  type: string;
  status: string;
  location: string;
};

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; emoji: string }> = {
  available: { label: "可用", bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30", emoji: "✅" },
  reserved: { label: "已预订", bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", emoji: "📋" },
  "in-use": { label: "在租", bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30", emoji: "🚢" },
  maintenance: { label: "维修中", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30", emoji: "🔧" },
};

const portLocations = ["上海港", "青岛港", "宁波港", "深圳港", "天津港", "厦门港", "大连港", "广州港", "连云港", "福州港"];
const containerTypes = ["40HQ", "40HC", "40GP", "20GP", "45HC"];

export default function InventoryMonitor() {
  const supabase = createClient();
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [filterType, setFilterType] = useState("全部");
  const [filterPort, setFilterPort] = useState("全部");
  const [filterStatus, setFilterStatus] = useState("全部");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    loadContainers();
    const interval = setInterval(() => { loadContainers(true); }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadContainers(silent = false) {
    if (!silent) setLoading(true);
    const { data } = await supabase.from("containers").select("*").order("container_no");
    if (data) { setContainers(data); setLastUpdate(new Date()); if (silent) { setAnimating(true); setTimeout(() => setAnimating(false), 1000); } }
    if (!silent) setLoading(false);
  }

  const total = containers.length;
  const stats = {
    available: containers.filter(c => c.status === "available").length,
    reserved: containers.filter(c => c.status === "reserved").length,
    "in-use": containers.filter(c => c.status === "in-use").length,
    maintenance: containers.filter(c => c.status === "maintenance").length,
  };

  const typeBreakdown: Record<string, Record<string, number>> = {};
  for (const c of containers) { if (!typeBreakdown[c.type]) typeBreakdown[c.type] = {}; typeBreakdown[c.type][c.status] = (typeBreakdown[c.type][c.status] || 0) + 1; }

  const portStats: Record<string, { total: number; available: number; inUse: number; reserved: number }> = {};
  for (const c of containers) {
    if (!portStats[c.location]) portStats[c.location] = { total: 0, available: 0, inUse: 0, reserved: 0 };
    portStats[c.location].total++;
    if (c.status === "available") portStats[c.location].available++;
    else if (c.status === "in-use") portStats[c.location].inUse++;
    else if (c.status === "reserved") portStats[c.location].reserved++;
  }

  const filtered = containers.filter(c => {
    if (filterType !== "全部" && c.type !== filterType) return false;
    if (filterPort !== "全部" && c.location !== filterPort) return false;
    if (filterStatus !== "全部" && c.status !== filterStatus) return false;
    return true;
  });

  const statusLabel = (s: string) => statusConfig[s]?.label || s;
  const sc = (s: string) => statusConfig[s] || { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30", emoji: "❓" };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <div className="bg-[#1E293B] border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div><h1 className="text-xl font-bold flex items-center gap-2"><span>📡</span> 库存实时监控</h1><p className="text-blue-300 text-xs mt-0.5">最后更新: {lastUpdate.toLocaleTimeString("zh-CN")} · 每30秒自动刷新</p></div>
          <button onClick={() => loadContainers()} className="text-sm text-blue-400 hover:text-white transition flex items-center gap-1">{loading ? "加载中..." : "🔄 刷新"}</button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 transition-opacity ${animating ? "opacity-50" : "opacity-100"}`}>
          <div className="bg-gradient-to-br from-emerald-600/80 to-emerald-900/80 rounded-2xl p-5 border border-emerald-500/20"><div className="flex items-center justify-between mb-2"><span className="text-3xl">📦</span><span className="text-xs text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">可用</span></div><div className="text-4xl font-bold">{stats.available}</div><div className="text-emerald-300 text-xs mt-1">可立即租用</div></div>
          <div className="bg-gradient-to-br from-violet-600/80 to-violet-900/80 rounded-2xl p-5 border border-violet-500/20"><div className="flex items-center justify-between mb-2"><span className="text-3xl">🚢</span><span className="text-xs text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full">在租</span></div><div className="text-4xl font-bold">{stats["in-use"]}</div><div className="text-violet-300 text-xs mt-1">使用中</div></div>
          <div className="bg-gradient-to-br from-amber-600/80 to-amber-900/80 rounded-2xl p-5 border border-amber-500/20"><div className="flex items-center justify-between mb-2"><span className="text-3xl">📋</span><span className="text-xs text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">已预订</span></div><div className="text-4xl font-bold">{stats.reserved}</div><div className="text-amber-300 text-xs mt-1">待起运</div></div>
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-5 border border-white/10"><div className="flex items-center justify-between mb-2"><span className="text-3xl">🔧</span><span className="text-xs text-slate-300 bg-slate-500/20 px-2 py-0.5 rounded-full">维护</span></div><div className="text-4xl font-bold">{stats.maintenance}</div><div className="text-slate-300 text-xs mt-1">维修/检修</div></div>
        </div>
        <div className="bg-[#1E293B] rounded-2xl p-5 border border-white/10 mb-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><span>🗺️</span> 港口库存分布 <span className="text-slate-400 font-normal text-sm ml-2">共 {total} 箱</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {portLocations.map(port => {
              const p = portStats[port] || { total: 0, available: 0, inUse: 0, reserved: 0 };
              const pct = total > 0 ? (p.total / total * 100) : 0;
              return (
                <div key={port} className="bg-slate-800/80 rounded-xl p-3 border border-white/5 hover:border-blue-500/30 transition">
                  <div className="text-xs text-slate-400 mb-2">{port}</div>
                  <div className="flex items-end justify-between"><div><span className="text-2xl font-bold text-white">{p.total}</span><span className="text-xs text-slate-500 ml-1">箱</span></div><div className="text-right"><div className="text-xs text-emerald-400">{p.available} 可用</div><div className="text-xs text-violet-400">{p.inUse} 在租</div></div></div>
                  <div className="mt-2 bg-slate-700 rounded-full h-1.5"><div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="bg-[#1E293B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"><option value="全部">全部箱型</option>{containerTypes.map(t => <option key={t} value={t}>{t}</option>)}</select>
          <select value={filterPort} onChange={e => setFilterPort(e.target.value)} className="bg-[#1E293B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"><option value="全部">全部港口</option>{portLocations.map(l => <option key={l} value={l}>{l}</option>)}</select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-[#1E293B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"><option value="全部">全部状态</option><option value="available">可用</option><option value="reserved">已预订</option><option value="in-use">在租</option><option value="maintenance">维修中</option></select>
          <div className="ml-auto text-sm text-slate-400 self-center">显示 {filtered.length} / {total} 箱</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(c => (
            <div key={c.id} className={`${sc(c.status).bg} ${sc(c.status).border} border rounded-xl p-4 hover:scale-[1.02] transition-transform`}>
              <div className="flex items-start justify-between mb-2"><div className="font-mono text-sm font-bold text-white">{c.container_no}</div><span className="text-lg">{sc(c.status).emoji}</span></div>
              <div className="text-xs text-slate-300 mb-1">{c.type}</div>
              <div className="text-xs text-slate-400 mb-2">{c.location}</div>
              <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${sc(c.status).bg} ${sc(c.status).text}`}>{statusLabel(c.status)}</div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && !loading && <div className="text-center py-16 text-slate-500"><div className="text-5xl mb-4">📭</div><p>暂无符合条件的集装箱</p></div>}
        {loading && <div className="text-center py-16 text-slate-500"><div className="text-5xl mb-4 animate-pulse">⏳</div><p>加载中...</p></div>}
        {Object.keys(typeBreakdown).length > 0 && (
          <div className="mt-6 bg-[#1E293B] rounded-2xl p-5 border border-white/10">
            <h2 className="text-base font-semibold mb-4">📊 箱型状态明细</h2>
            <div className="space-y-3">
              {Object.entries(typeBreakdown).map(([type, breakdown]) => {
                const typeTotal = Object.values(breakdown).reduce((a, b) => a + b, 0);
                return (
                  <div key={type} className="bg-slate-800/80 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3"><span className="font-semibold text-white">{type}</span><span className="text-sm text-slate-400">{typeTotal} 箱</span></div>
                    <div className="flex gap-1 h-6 rounded-full overflow-hidden">
                      {Object.entries(breakdown).map(([status, count]) => {
                        const cfg = statusConfig[status];
                        if (!cfg) return null;
                        const pct = typeTotal > 0 ? (count / typeTotal * 100) : 0;
                        return <div key={status} className={`${cfg.bg} ${cfg.text} text-xs flex items-center justify-center font-medium`} style={{ width: `${pct}%` }}>{pct > 15 ? `${count}` : ""}</div>;
                      })}
                    </div>
                    <div className="flex gap-4 mt-2">{Object.entries(breakdown).map(([status, count]) => { const cfg = statusConfig[status]; if (!cfg) return null; return <div key={status} className="flex items-center gap-1 text-xs"><span>{cfg.emoji}</span><span className={cfg.text}>{count}</span></div>; })}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}