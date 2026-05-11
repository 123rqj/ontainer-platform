import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            全球集装箱租赁服务
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            专业40HQ/40HC集装箱租赁，覆盖国际主要港口，灵活租期，美元结算
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/quote"
              className="bg-[#F97316] hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition"
            >
              立即询价
            </Link>
            <Link
              href="/inventory"
              className="border-2 border-white hover:bg-white hover:text-[#1E3A5F] text-white px-8 py-3 rounded-lg font-medium transition"
            >
              查看库存
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#2563EB]">110+</div>
              <div className="text-[#64748B] text-sm mt-1">现货箱量</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2563EB]">40HQ</div>
              <div className="text-[#64748B] text-sm mt-1">主力箱型</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2563EB]">USD</div>
              <div className="text-[#64748B] text-sm mt-1">美元结算</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2563EB]">7×24</div>
              <div className="text-[#64748B] text-sm mt-1">在线服务</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">我们的服务</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="font-semibold text-lg mb-2">多种箱型</h3>
              <p className="text-[#64748B] text-sm">
                40HQ、40HC、20GP等多种规格，现货充足，满足不同货物运输需求
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="font-semibold text-lg mb-2">全球覆盖</h3>
              <p className="text-[#64748B] text-sm">
                覆盖亚洲、欧洲、美洲、非洲主要港口，灵活租期，全程跟踪
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-semibold text-lg mb-2">美元结算</h3>
              <p className="text-[#64748B] text-sm">
                租金以美元结算，汇率透明，灭失费用约定清晰，无隐藏成本
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1E3A5F] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">准备好开始了吗？</h2>
          <p className="text-blue-200 mb-8">提交询价，我们的团队将在24小时内回复</p>
          <Link
            href="/quote"
            className="bg-[#F97316] hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition"
          >
            开始询价
          </Link>
        </div>
      </section>
    </div>
  );
}
