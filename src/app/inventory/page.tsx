import { createClient } from "@/lib/supabase-server";

export default async function InventoryPage() {
  const supabase = await createClient();

  // 获取各箱型的库存统计
  const { data: inventory } = await supabase
    .from("containers")
    .select("type, status")
    .order("type");

  // 按箱型分组统计
  const stats: Record<string, Record<string, number>> = {};
  if (inventory) {
    for (const item of inventory) {
      if (!stats[item.type]) {
        stats[item.type] = { available: 0, reserved: 0, "in-use": 0, maintenance: 0 };
      }
      stats[item.type][item.status] = (stats[item.type][item.status] || 0) + 1;
    }
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    available: { label: "可用", color: "bg-green-100 text-green-700" },
    reserved: { label: "已预订", color: "bg-yellow-100 text-yellow-700" },
    "in-use": { label: "在租", color: "bg-purple-100 text-purple-700" },
    maintenance: { label: "维修中", color: "bg-red-100 text-red-700" },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">实时库存查询</h1>
        <p className="text-[#64748B]">查看当前可用箱量，所有数据实时更新</p>
      </div>

      {/* 库存卡片 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {Object.entries(stats).map(([type, statusCounts]) => (
          <div key={type} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📦</span>
                <div>
                  <div className="font-bold text-xl">{type}</div>
                  <div className="text-sm text-[#64748B]">集装箱</div>
                </div>
              </div>
            </div>

            {/* 状态分布 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B]">可用</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${Math.round((statusCounts.available / Object.values(statusCounts).reduce((a, b) => a + b, 0)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="font-bold text-green-600">{statusCounts.available}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B]">已预订</span>
                <span className="font-medium text-yellow-600">{statusCounts.reserved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B]">在租</span>
                <span className="font-medium text-purple-600">{statusCounts["in-use"]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#64748B]">维修中</span>
                <span className="font-medium text-red-600">{statusCounts.maintenance}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between">
                <span className="text-sm font-medium">总计</span>
                <span className="font-bold">
                  {Object.values(statusCounts).reduce((a, b) => a + b, 0)} 箱
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 状态说明 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold mb-4">状态说明</h2>
        <div className="grid md:grid-cols-4 gap-4 text-sm">
          {Object.entries(statusLabels).map(([key, { label, color }]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${color}`}>{label}</span>
              <span className="text-[#64748B]">
                {key === "available" && "可立即租用"}
                {key === "reserved" && "已被预订，待生效"}
                {key === "in-use" && "当前在租"}
                {key === "maintenance" && "维修中，暂不可用"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
