import { createClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();

  // 获取库内库存统计
  const { data: containers } = await supabase
    .from("containers")
    .select("status");

  const totalCount = containers?.length || 0;
  const inTransitCount = containers?.filter(c =>
    (c.status || "").includes("在途") || (c.status || "").includes("回程")
  ).length || 0;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[520px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/hero-container.jpg')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A5F]/95 via-[#1E3A5F]/80 to-[#1E3A5F]/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-block bg-[#F97316] text-white text-sm px-3 py-1 rounded-full mb-4">
              专业 · 可靠 · 全球覆盖
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              杨凌国合跨境物流
            </h1>
            <p className="text-xl text-blue-100 mb-4 max-w-xl">
              专注国际集装箱租赁服务，主营40HQ优质现货箱
            </p>
            <p className="text-blue-200 mb-8 text-sm">
              覆盖亚洲·欧洲·美洲·非洲主要港口，美元结算，灭失约定清晰
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/quote"
                className="bg-[#F97316] hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition text-center"
              >
                立即询价
              </Link>
              <Link
                href="/inventory"
                className="border-2 border-white/50 hover:border-white hover:bg-white/10 text-white px-8 py-3 rounded-lg font-medium transition text-center"
              >
                查看库存
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - 真实数据 */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#2563EB]">{totalCount}</div>
              <div className="text-[#64748B] text-sm mt-1">库存总量</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#10B981]">{totalCount - inTransitCount}</div>
              <div className="text-[#64748B] text-sm mt-1">可用箱量</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2563EB]">{inTransitCount}</div>
              <div className="text-[#64748B] text-sm mt-1">在途/回程</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2563EB]">40HC</div>
              <div className="text-[#64748B] text-sm mt-1">主力箱型</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-3">我们的服务</h2>
            <p className="text-[#64748B] max-w-md mx-auto">提供全方位集装箱租赁解决方案，安全高效值得信赖</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="text-4xl mb-4">🚢</div>
              <h3 className="font-semibold text-lg text-[#1E3A5F] mb-2">多种箱型</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">
                40HQ、40HC、20GP等多种规格，现货充足，满足不同货物运输需求
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="font-semibold text-lg text-[#1E3A5F] mb-2">全球覆盖</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">
                覆盖亚洲、欧洲、美洲、非洲主要港口，灵活租期，全程跟踪
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-semibold text-lg text-[#1E3A5F] mb-2">美元结算</h3>
              <p className="text-[#64748B] text-sm leading-relaxed">
                租金以美元结算，汇率透明，灭失费用约定清晰，无隐藏成本
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6">为什么选择我们？</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#2563EB] font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1E3A5F]">现货充足</h4>
                    <p className="text-[#64748B] text-sm mt-1">{totalCount}个集装箱，随时可用，缩短等待时间</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#2563EB] font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1E3A5F]">价格透明</h4>
                    <p className="text-[#64748B] text-sm mt-1">美元结算，灭失费用提前约定，无隐藏费用</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#2563EB] font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1E3A5F]">服务专业</h4>
                    <p className="text-[#64748B] text-sm mt-1">24小时内响应，专业的国际物流团队支持</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden h-80">
              <img
                src="/hero-container.jpg"
                alt="集装箱港口"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#1E3A5F] to-[#2563EB] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-blue-200 mb-8">提交询价，我们的团队将在24小时内回复</p>
          <Link
            href="/quote"
            className="bg-[#F97316] hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition inline-block"
          >
            开始询价
          </Link>
        </div>
      </section>
    </div>
  );
}