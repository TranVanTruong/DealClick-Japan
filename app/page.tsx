"use client";

import { useEffect, useMemo, useState } from "react";
import type { Deal } from "@/lib/rakuten";

const categoryOptions = [
  { value: "all", label: "すべて" },
  { value: "fashion", label: "ファッション" },
  { value: "beauty", label: "美容" },
  { value: "gadget", label: "家電" },
  { value: "food", label: "グルメ" },
  { value: "daily", label: "日用品" },
  { value: "baby", label: "ベビー・キッズ" }
];

export default function HomePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDeals(nextCategory = category, nextQuery = query) {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({ category: nextCategory, hits: "24" });
    if (nextQuery.trim()) params.set("keyword", nextQuery.trim());

    try {
      const response = await fetch(`/api/deals?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || "Failed to load deals");
      setDeals(data.deals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeals("all", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featuredDeals = useMemo(() => deals.filter((deal) => deal.featured).slice(0, 4), [deals]);

  async function trackAndOpen(deal: Deal) {
    setDeals((current) =>
      current.map((item) => item.id === deal.id ? { ...item, clicks: item.clicks + 1 } : item)
    );

    fetch("/api/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dealId: deal.id, store: deal.store, url: deal.url })
    }).catch(() => {});

    window.open(deal.url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="relative overflow-hidden px-6 py-8 md:px-10 lg:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.35),transparent_34%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_28%),linear-gradient(135deg,rgba(20,20,20,1),rgba(63,23,23,0.65))]" />
        <div className="relative mx-auto max-w-7xl">
          <nav className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
            <button onClick={() => setSelectedDeal(null)} className="flex items-center gap-3 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl font-black text-red-600 shadow-lg shadow-red-950/30">
                得
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">DealClick Japan</h1>
                <p className="text-xs text-zinc-300">楽天市場のリアル商品データからセールを表示</p>
              </div>
            </button>
            <a href="#deals" className="rounded-2xl bg-white px-4 py-2 text-center text-sm font-bold text-zinc-950 hover:bg-red-50">
              セールを見る
            </a>
          </nav>

          {!selectedDeal ? (
            <>
              <div className="grid items-center gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr]">
                <div>
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-500/10 px-4 py-2 text-sm text-red-100">
                    🇯🇵 Real Rakuten API Data
                  </div>
                  <h2 className="max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
                    Japan deals, real data, one click.
                  </h2>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                    DealClick Japan lấy dữ liệu thật từ Rakuten Ichiba API: sản phẩm, giá, điểm hoàn, ảnh, đánh giá và link chính thức/affiliate.
                  </p>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      loadDeals(category, query);
                    }}
                    className="mt-8 grid gap-3 rounded-[2rem] bg-white/10 p-4 md:grid-cols-[1fr_auto_auto]"
                  >
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="例: コスメ クーポン, 家電 セール..."
                      className="h-12 rounded-2xl border border-white/10 bg-white px-4 text-zinc-950 outline-none ring-red-500 transition focus:ring-2"
                    />
                    <select
                      value={category}
                      onChange={(event) => {
                        setCategory(event.target.value);
                        loadDeals(event.target.value, query);
                      }}
                      className="h-12 rounded-2xl border border-white/10 bg-white px-4 text-zinc-950 outline-none ring-red-500 transition focus:ring-2"
                    >
                      {categoryOptions.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                    <button className="h-12 rounded-2xl bg-red-500 px-6 font-bold text-white hover:bg-red-600">
                      検索
                    </button>
                  </form>
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-5 text-white shadow-2xl shadow-red-950/40 backdrop-blur">
                  <img
                    src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop"
                    alt="Tokyo Japan shopping street"
                    className="h-72 w-full rounded-[1.5rem] object-cover"
                  />
                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <Stat icon="🏬" value={deals.length} label="Deals" />
                    <Stat icon="🎟️" value={deals.filter((deal) => deal.coupon).length} label="Point deals" />
                    <Stat icon="📊" value={deals.reduce((sum, deal) => sum + deal.clicks, 0)} label="Clicks" />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-8 rounded-3xl border border-red-300/30 bg-red-500/10 p-5 text-red-100">
                  <p className="font-black">API error</p>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              )}

              <FeaturedDeals deals={featuredDeals} onDetail={setSelectedDeal} onOpen={trackAndOpen} />

              <section id="deals" className="-mx-6 bg-zinc-100 px-6 py-14 text-zinc-950 md:-mx-10 md:px-10 lg:-mx-16 lg:px-16">
                <div className="mx-auto max-w-7xl">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="mb-2 font-semibold text-red-600">リアルデータ</p>
                      <h3 className="text-4xl font-black tracking-tight">Rakuten Deals</h3>
                    </div>
                    {loading && <p className="font-bold text-zinc-500">Loading...</p>}
                  </div>

                  <div className="mt-9 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {deals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} onDetail={setSelectedDeal} onOpen={trackAndOpen} />
                    ))}
                  </div>

                  {!loading && deals.length === 0 && !error && (
                    <div className="mt-12 rounded-3xl bg-white p-10 text-center shadow-lg">
                      <p className="text-lg font-bold">データが見つかりません。</p>
                      <p className="mt-2 text-zinc-500">キーワードを変更してください。</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : (
            <DealDetail deal={selectedDeal} onBack={() => setSelectedDeal(null)} onOpen={trackAndOpen} />
          )}
        </div>
      </section>

      <footer className="bg-zinc-950 px-6 py-8 text-center text-sm text-zinc-400">
        © 2026 DealClick Japan. Powered by Rakuten Web Service.
      </footer>
    </main>
  );
}

function Stat({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="mx-auto mb-2 text-xl text-red-200">{icon}</div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-zinc-300">{label}</p>
    </div>
  );
}

function FeaturedDeals({
  deals,
  onDetail,
  onOpen
}: {
  deals: Deal[];
  onDetail: (deal: Deal) => void;
  onOpen: (deal: Deal) => void;
}) {
  if (!deals.length) return null;

  return (
    <section className="mb-10 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
      <div className="mb-5">
        <p className="font-semibold text-red-200">おすすめ</p>
        <h3 className="text-2xl font-black">Featured Rakuten Deals</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {deals.map((deal) => (
          <button key={deal.id} onClick={() => onDetail(deal)} className="group overflow-hidden rounded-3xl bg-white text-left text-zinc-950 shadow-xl">
            <img src={deal.image} alt={deal.title} className="h-36 w-full object-cover transition group-hover:scale-105" />
            <div className="p-4">
              <p className="text-xs font-bold text-red-600">{deal.store}</p>
              <h4 className="mt-1 line-clamp-2 font-black">{deal.jpTitle}</h4>
              <p className="mt-2 rounded-full bg-red-50 px-3 py-1 text-sm font-black text-red-600">{deal.discount}</p>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen(deal);
                }}
                className="mt-3 w-full rounded-2xl bg-zinc-950 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
              >
                公式サイトへ ↗
              </button>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function DealCard({
  deal,
  onDetail,
  onOpen
}: {
  deal: Deal;
  onDetail: (deal: Deal) => void;
  onOpen: (deal: Deal) => void;
}) {
  return (
    <article className="group overflow-hidden rounded-[1.75rem] bg-white shadow-xl shadow-zinc-200/70">
      <div className="relative">
        <img src={deal.image} alt={deal.title} className="h-52 w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute left-4 top-4 rounded-full bg-red-500 px-4 py-2 text-sm font-black text-white shadow-lg">
          {deal.discount}
        </div>
        {deal.coupon && <div className="absolute right-4 top-4 rounded-full bg-white px-3 py-2 text-xs font-black text-red-600">POINT</div>}
      </div>
      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">{deal.category}</span>
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">{deal.area}</span>
        </div>
        <p className="text-sm font-bold text-red-600">{deal.store}</p>
        <h4 className="mt-1 line-clamp-2 text-xl font-black tracking-tight">{deal.jpTitle}</h4>
        <p className="mt-2 line-clamp-3 min-h-[72px] text-sm leading-6 text-zinc-600">{deal.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-zinc-500">
          <span>{deal.price ? `¥${deal.price.toLocaleString("ja-JP")}` : deal.priceNote}</span>
          <span>{deal.reviewAverage ? `★ ${deal.reviewAverage}` : "楽天市場"}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={() => onDetail(deal)} className="h-11 rounded-2xl border border-zinc-200 font-bold hover:bg-zinc-50">詳細</button>
          <button onClick={() => onOpen(deal)} className="h-11 rounded-2xl bg-zinc-950 font-bold text-white hover:bg-red-600">公式サイト ↗</button>
        </div>
      </div>
    </article>
  );
}

function DealDetail({
  deal,
  onBack,
  onOpen
}: {
  deal: Deal;
  onBack: () => void;
  onOpen: (deal: Deal) => void;
}) {
  return (
    <section className="py-12">
      <button onClick={onBack} className="mb-6 rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15">← Back</button>
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <img src={deal.image} alt={deal.title} className="h-[430px] w-full rounded-[2rem] object-cover shadow-2xl" />
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-7 backdrop-blur">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-black">{deal.discount}</span>
            {deal.coupon && <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-red-600">ポイント還元</span>}
          </div>
          <p className="mt-7 text-sm font-bold text-red-200">{deal.store}</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">{deal.jpTitle}</h2>
          <p className="mt-5 text-lg leading-8 text-zinc-200">{deal.description}</p>
          <div className="mt-7 grid gap-3 md:grid-cols-2">
            <Info icon="🏷️" label="カテゴリ" value={deal.category} />
            <Info icon="💴" label="価格" value={deal.price ? `¥${deal.price.toLocaleString("ja-JP")}` : "公式サイトで確認"} />
            <Info icon="🎟️" label="条件" value={deal.priceNote} />
            <Info icon="⭐" label="レビュー" value={deal.reviewAverage || "N/A"} />
            <Info icon="🔗" label="Website" value={deal.url.replace(/^https?:\/\//, "")} />
          </div>
          <button
            onClick={() => onOpen(deal)}
            className="mt-8 w-full rounded-2xl bg-red-500 px-5 py-4 text-lg font-black text-white hover:bg-red-600"
          >
            公式サイトで確認する ↗
          </button>
        </div>
      </div>
    </section>
  );
}

function Info({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-red-200"><span>{icon}</span><span>{label}</span></div>
      <p className="break-words font-bold">{value}</p>
    </div>
  );
}
