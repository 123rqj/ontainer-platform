import { createClient } from "@/lib/supabase-server";

export default async function InventoryPage() {
  const supabase = await createClient();

  // 获取各区域的库内库存
  const { data: containers } = await supabase
    .from("containers")
    .select("location, status")
    .not("location", "is", null);

  // 获取在途箱统计
  const { data: transitContainers } = await supabase
    .from("transit_containers")
    .select("destination, origin");

  // 按区域分组统计库内箱
  const locationStats: Record<string, { total: number; available: number }> = {};
  if (containers) {
    for (const c of containers) {
      if (!c.location) continue;
      if (!locationStats[c.location]) {
        locationStats[c.location] = { total: 0, available: 0 };
      }
      locationStats[c.location].total++;
      if (c.status === "available") {
        locationStats[c.location].available++;
      }
    }
  }

  // 按目的地分组在途箱
  const transitStats: Record<string, number> = {};
  if (transitContainers) {
    for (const t of transitContainers) {
      if (!t.destination) continue;
      transitStats[t.destination] = (transitStats[t.destination] || 0) + 1;
    }
  }

  const locationLabels: Record<string, string> = {
    "西安": "西安",
    "成都": "成都",
    "青岛": "青岛",
    "太仓": "太仓",
    "郑州": "郑州",
    "武汉": "武汉",
    "明斯克": "明斯克",
    "莫斯科": "莫斯科",
    "巴库": "巴库",
    "阿拉木图": "阿拉木图",
  };

  const transitLocationLabels: Record<string, string> = {
    "马拉": "马拉",
    "杜伊斯堡": "杜伊斯堡",
    "莫斯科": "莫斯科",
    "明斯克": "明斯克",
    "圣彼得堡": "圣彼得堡",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">实时库存查询</h1>
        <p className="text-[#64748B]">查看当前可用箱量，所有数据实时更新</p>
      </div>

      {/* 库内箱库存 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1E3A5F] mb-4">📍 库内箱（{containers?.length || 0}箱）</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(locationStats)
            .sort((a, b) => b[1].total - a[1].total)
            .map(([location, { total, available }]) => (
              <div key={location} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="text-lg font-bold text-[#1E3A5F] mb-1">
                  {locationLabels[location] || location}
                </div>
                <div className="text-2xl font-bold text-[#2563EB]">{total}</div>
                <div className="text-sm text-[#64748B]">库内总量</div>
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-sm text-green-600 font-medium">{available} 可用</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 在途箱 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1E3A5F] mb-4">🚚 在途箱（{transitContainers?.length || 0}箱）</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(transitStats)
            .sort((a, b) => b[1] - a[1])
            .map(([destination, count]) => (
              <div key={destination} className="bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] rounded-xl p-4 text-white">
                <div className="text-sm opacity-80 mb-1">
                  {transitLocationLabels[destination] || destination}
                </div>
                <div className="text-3xl font-bold">{count}</div>
                <div className="text-sm opacity-80">在途箱量</div>
              </div>
            ))}
        </div>
      </div>

      {/* 汇总 */}
      <div className="bg-[#F8FAFC] rounded-xl p-6">
        <div className="flex justify-center gap-12 text-center">
          <div>
            <div className="text-3xl font-bold text-[#1E3A5F]">{containers?.length || 0}</div>
            <div className="text-[#64748B] text-sm mt-1">库内箱</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#10B981]">
              {containers?.filter(c => c.status === "available").length || 0}
            </div>
            <div className="text-[#64748B] text-sm mt-1">可用</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#2563EB]">{transitContainers?.length || 0}</div>
            <div className="text-[#64748B] text-sm mt-1">在途</div>
          </div>
        </div>
      </div>
    </div>
  );
}