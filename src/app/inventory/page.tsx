import { createClient } from "@/lib/supabase-server";

export default async function InventoryPage() {
  const supabase = await createClient();

  const { data: containers } = await supabase
    .from("containers")
    .select("container_no, status");

  const inStock: Record<string, number> = {};
  const inTransit: Record<string, number> = {};
  const returned: Record<string, number> = {};
  let total = 0;

  if (containers) {
    for (const c of containers) {
      total++;
      const s = c.status || "";
      if (s.includes("在途") || s.includes("回程") || s.includes("还")) {
        // 归类到目的地
        const dest = s.replace("在途", "").replace("回程", "").replace("还", "-").replace("申请", "").replace("未", "").trim();
        if (s.includes("在途") || s.includes("回程")) {
          inTransit[dest] = (inTransit[dest] || 0) + 1;
        } else if (s.includes("已还")) {
          returned[dest] = (returned[dest] || 0) + 1;
        } else {
          inTransit[dest] = (inTransit[dest] || 0) + 1;
        }
      } else if (s.includes("堆场")) {
        const loc = s.replace("在", "").replace("堆场", "");
        inStock[loc] = (inStock[loc] || 0) + 1;
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">实时库存查询</h1>
        <p className="text-[#64748B]">查看当前可用箱量，所有数据实时更新</p>
      </div>

      {/* 汇总 */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2563EB] rounded-xl p-8 text-white mb-8">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold">{total}</div>
            <div className="text-blue-200 mt-1">库存总量</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-300">
              {Object.values(inStock).reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-blue-200 mt-1">库内堆场</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-orange-300">
              {Object.values(inTransit).reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-blue-200 mt-1">在途/回程</div>
          </div>
        </div>
      </div>

      {/* 库内箱 */}
      {Object.keys(inStock).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1E3A5F] mb-4">
            📍 库内箱（{Object.values(inStock).reduce((a, b) => a + b, 0)}箱）
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(inStock)
              .sort((a, b) => b[1] - a[1])
              .map(([loc, count]) => (
                <div key={loc} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-lg font-bold text-[#1E3A5F]">{loc}</div>
                  <div className="text-3xl font-bold text-[#2563EB] mt-1">{count}</div>
                  <div className="text-sm text-[#64748B]">库内箱量</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 在途/回程箱 */}
      {Object.keys(inTransit).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1E3A5F] mb-4">
            🚚 在途/回程箱（{Object.values(inTransit).reduce((a, b) => a + b, 0)}箱）
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(inTransit)
              .sort((a, b) => b[1] - a[1])
              .map(([route, count]) => (
                <div key={route} className="bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] rounded-xl p-4 text-white">
                  <div className="text-sm opacity-80">{route}</div>
                  <div className="text-3xl font-bold mt-1">{count}</div>
                  <div className="text-sm opacity-80">在途/回程</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 已还箱 */}
      {Object.keys(returned).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1E3A5F] mb-4">
            ✅ 已还箱（{Object.values(returned).reduce((a, b) => a + b, 0)}箱）
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(returned)
              .sort((a, b) => b[1] - a[1])
              .map(([loc, count]) => (
                <div key={loc} className="bg-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="text-sm text-[#64748B]">{loc}</div>
                  <div className="text-2xl font-bold text-gray-500 mt-1">{count}</div>
                  <div className="text-xs text-gray-400">已还</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}