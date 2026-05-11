import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/admin");
  }

  // 获取所有箱号
  const { data: containers } = await supabase
    .from("containers")
    .select("*")
    .order("container_no");

  // 获取所有询价单
  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  // 获取所有订单
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  const statusLabels: Record<string, { label: string; color: string }> = {
    available: { label: "可用", color: "bg-green-100 text-green-700" },
    reserved: { label: "已预订", color: "bg-yellow-100 text-yellow-700" },
    "in-use": { label: "在租", color: "bg-purple-100 text-purple-700" },
    maintenance: { label: "维修中", color: "bg-red-100 text-red-700" },
    pending: { label: "待报价", color: "bg-yellow-100 text-yellow-700" },
    quoted: { label: "已报价", color: "bg-blue-100 text-blue-700" },
    confirmed: { label: "已确认", color: "bg-green-100 text-green-700" },
    cancelled: { label: "已取消", color: "bg-gray-100 text-gray-700" },
    returned: { label: "已归还", color: "bg-gray-100 text-gray-700" },
    completed: { label: "已完成", color: "bg-gray-100 text-gray-700" },
  };

  // 箱型统计
  const typeStats: Record<string, number> = {};
  if (containers) {
    for (const c of containers) {
      typeStats[c.type] = (typeStats[c.type] || 0) + 1;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">管理后台</h1>
          <p className="text-[#64748B] text-sm mt-1">
            {user.email} · 内部使用
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/"
            className="text-sm text-[#64748B] hover:text-[#1E293B] transition pt-2"
          >
            返回首页
          </Link>
          <form action="/auth/logout" method="post">
            <button className="text-sm text-red-500 hover:text-red-600 transition">
              退出登录
            </button>
          </form>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-[#64748B]">总箱量</div>
          <div className="text-2xl font-bold">{containers?.length || 0}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-[#64748B]">在租</div>
          <div className="text-2xl font-bold text-purple-600">
            {containers?.filter((c) => c.status === "in-use").length || 0}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-[#64748B]">待处理询价</div>
          <div className="text-2xl font-bold text-yellow-600">
            {quotes?.filter((q) => q.status === "pending").length || 0}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-[#64748B]">活跃订单</div>
          <div className="text-2xl font-bold text-green-600">
            {orders?.filter((o) => ["confirmed", "in-use"].includes(o.status))
              .length || 0}
          </div>
        </div>
      </div>

      {/* 箱型分布 */}
      <div className="bg-white rounded-xl shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold">箱型分布</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-4">
            {Object.entries(typeStats).map(([type, count]) => (
              <div
                key={type}
                className="bg-[#F8FAFC] rounded-lg px-4 py-2 flex items-center gap-2"
              >
                <span className="text-sm text-[#64748B]">{type}</span>
                <span className="font-bold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 箱号列表 */}
      <div className="bg-white rounded-xl shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold">箱号管理</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#64748B] bg-[#F8FAFC]">
                <th className="px-6 py-3 font-medium">箱号</th>
                <th className="px-6 py-3 font-medium">箱型</th>
                <th className="px-6 py-3 font-medium">状态</th>
                <th className="px-6 py-3 font-medium">位置</th>
                <th className="px-6 py-3 font-medium">关联订单</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {containers?.map((container) => (
                <tr key={container.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-6 py-3 font-mono">{container.container_no}</td>
                  <td className="px-6 py-3">{container.type}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        statusLabels[container.status]?.color || "bg-gray-100"
                      }`}
                    >
                      {statusLabels[container.status]?.label || container.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[#64748B]">
                    {container.location}
                  </td>
                  <td className="px-6 py-3 text-[#64748B]">
                    {container.current_order_id || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 询价单列表 */}
      <div className="bg-white rounded-xl shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold">询价单（最新20条）</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#64748B] bg-[#F8FAFC]">
                <th className="px-6 py-3 font-medium">单号</th>
                <th className="px-6 py-3 font-medium">路线</th>
                <th className="px-6 py-3 font-medium">箱型/量</th>
                <th className="px-6 py-3 font-medium">租期</th>
                <th className="px-6 py-3 font-medium">联系人</th>
                <th className="px-6 py-3 font-medium">状态</th>
                <th className="px-6 py-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {quotes?.map((quote) => (
                <tr key={quote.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-6 py-3 font-mono text-[#2563EB]">
                    {quote.quote_no}
                  </td>
                  <td className="px-6 py-3">
                    {quote.origin} → {quote.destination}
                  </td>
                  <td className="px-6 py-3">
                    {quote.container_type} × {quote.quantity}
                  </td>
                  <td className="px-6 py-3">{quote.lease_days}天</td>
                  <td className="px-6 py-3">
                    <div className="font-medium">{quote.contact_name}</div>
                    <div className="text-[#64748B] text-xs">
                      {quote.contact_email}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        statusLabels[quote.status]?.color || "bg-gray-100"
                      }`}
                    >
                      {statusLabels[quote.status]?.label || quote.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[#64748B]">
                    {new Date(quote.created_at).toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold">订单（最新20条）</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#64748B] bg-[#F8FAFC]">
                <th className="px-6 py-3 font-medium">订单号</th>
                <th className="px-6 py-3 font-medium">路线</th>
                <th className="px-6 py-3 font-medium">箱型/量</th>
                <th className="px-6 py-3 font-medium">租金</th>
                <th className="px-6 py-3 font-medium">灭失费</th>
                <th className="px-6 py-3 font-medium">状态</th>
                <th className="px-6 py-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders?.map((order) => (
                <tr key={order.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-6 py-3 font-mono text-[#2563EB]">
                    {order.order_no}
                  </td>
                  <td className="px-6 py-3">
                    {order.origin} → {order.destination}
                  </td>
                  <td className="px-6 py-3">
                    {order.container_type} × {order.quantity}
                  </td>
                  <td className="px-6 py-3">${order.rent_usd}</td>
                  <td className="px-6 py-3">${order.loss_fee_usd}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        statusLabels[order.status]?.color || "bg-gray-100"
                      }`}
                    >
                      {statusLabels[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[#64748B]">
                    {new Date(order.created_at).toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
