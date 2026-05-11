import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 获取用户资料
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 获取用户的询价单
  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("contact_email", user.email)
    .order("created_at", { ascending: false })
    .limit(10);

  // 获取用户的订单
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "待报价", color: "bg-yellow-100 text-yellow-700" },
    quoted: { label: "已报价", color: "bg-blue-100 text-blue-700" },
    confirmed: { label: "已确认", color: "bg-green-100 text-green-700" },
    cancelled: { label: "已取消", color: "bg-gray-100 text-gray-700" },
    "in-use": { label: "在租", color: "bg-purple-100 text-purple-700" },
    returned: { label: "已归还", color: "bg-gray-100 text-gray-700" },
    completed: { label: "已完成", color: "bg-gray-100 text-gray-700" },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">我的控制台</h1>
          <p className="text-[#64748B] text-sm mt-1">
            欢迎回来，{profile?.company || profile?.email || "客户"}
          </p>
        </div>
        <form action="/auth/logout" method="post">
          <button className="text-sm text-[#64748B] hover:text-red-500 transition">
            退出登录
          </button>
        </form>
      </div>

      {/* 快捷操作 */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/quote"
          className="bg-[#F97316] hover:bg-orange-600 text-white rounded-xl p-6 text-center transition"
        >
          <div className="text-2xl mb-2">📦</div>
          <div className="font-medium">提交询价</div>
        </Link>
        <Link
          href="/inventory"
          className="bg-white hover:bg-gray-50 rounded-xl p-6 text-center border border-gray-200 transition"
        >
          <div className="text-2xl mb-2">📊</div>
          <div className="font-medium text-[#1E293B]">查看库存</div>
        </Link>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-2xl mb-2">📝</div>
          <div className="font-medium text-[#1E293B]">
            询价单 {quotes?.length || 0} 条
          </div>
          <div className="text-sm text-[#64748B]">
            订单 {orders?.length || 0} 条
          </div>
        </div>
      </div>

      {/* 询价单列表 */}
      <div className="bg-white rounded-xl shadow-sm mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold">我的询价单</h2>
        </div>
        <div className="p-6">
          {quotes && quotes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#64748B]">
                    <th className="pb-3 font-medium">询价单号</th>
                    <th className="pb-3 font-medium">路线</th>
                    <th className="pb-3 font-medium">箱型</th>
                    <th className="pb-3 font-medium">箱量</th>
                    <th className="pb-3 font-medium">租期</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 font-medium">提交时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {quotes.map((quote) => (
                    <tr key={quote.id}>
                      <td className="py-3 font-mono text-[#2563EB]">
                        {quote.quote_no}
                      </td>
                      <td className="py-3">
                        {quote.origin} → {quote.destination}
                      </td>
                      <td className="py-3">{quote.container_type}</td>
                      <td className="py-3">{quote.quantity}</td>
                      <td className="py-3">{quote.lease_days}天</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            statusLabels[quote.status]?.color || "bg-gray-100"
                          }`}
                        >
                          {statusLabels[quote.status]?.label || quote.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#64748B]">
                        {new Date(quote.created_at).toLocaleDateString("zh-CN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-[#64748B]">
              <div className="text-4xl mb-3">📭</div>
              <p>暂无询价记录</p>
              <Link
                href="/quote"
                className="text-[#2563EB] hover:underline text-sm mt-2 inline-block"
              >
                提交第一个询价
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold">我的订单</h2>
        </div>
        <div className="p-6">
          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#64748B]">
                    <th className="pb-3 font-medium">订单号</th>
                    <th className="pb-3 font-medium">路线</th>
                    <th className="pb-3 font-medium">箱型/数量</th>
                    <th className="pb-3 font-medium">租金(USD)</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 font-medium">创建时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-3 font-mono text-[#2563EB]">
                        {order.order_no}
                      </td>
                      <td className="py-3">
                        {order.origin} → {order.destination}
                      </td>
                      <td className="py-3">
                        {order.container_type} × {order.quantity}
                      </td>
                      <td className="py-3">${order.rent_usd}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            statusLabels[order.status]?.color || "bg-gray-100"
                          }`}
                        >
                          {statusLabels[order.status]?.label || order.status}
                        </span>
                      </td>
                      <td className="py-3 text-[#64748B]">
                        {new Date(order.created_at).toLocaleDateString("zh-CN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-[#64748B]">
              <div className="text-4xl mb-3">📋</div>
              <p>暂无订单记录</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
