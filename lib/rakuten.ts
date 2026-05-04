export type Deal = {
  id: string;
  store: string;
  title: string;
  jpTitle: string;
  description: string;
  discount: string;
  category: string;
  area: string;
  priceNote: string;
  expires: string;
  url: string;
  image: string;
  clicks: number;
  coupon: boolean;
  featured: boolean;
  price: number | null;
  reviewAverage: number | null;
  reviewCount: number | null;
};

type RakutenApiItemWrapper = {
  Item: {
    itemCode: string;
    itemName: string;
    itemCaption?: string;
    itemPrice?: number;
    itemUrl: string;
    affiliateUrl?: string;
    shopName?: string;
    genreId?: string;
    reviewAverage?: number;
    reviewCount?: number;
    mediumImageUrls?: Array<{ imageUrl: string }>;
    pointRate?: number;
    pointRateEndTime?: string;
  };
};

const categoryLabels: Record<string, string> = {
  all: "EC・通販",
  fashion: "ファッション",
  beauty: "美容・ドラッグストア",
  gadget: "家電・ガジェット",
  food: "グルメ",
  travel: "旅行・ホテル",
  daily: "日用品",
  baby: "ベビー・キッズ"
};

export const categoryKeywords: Record<string, string> = {
  all: "セール クーポン 送料無料",
  fashion: "ファッション セール",
  beauty: "コスメ クーポン",
  gadget: "家電 セール",
  food: "食品 送料無料",
  travel: "旅行 トラベルグッズ",
  daily: "日用品 セール",
  baby: "ベビー キッズ セール"
};

export function keywordForCategory(category?: string) {
  return categoryKeywords[category || "all"] || categoryKeywords.all;
}

export function cleanImage(url?: string) {
  if (!url) return "";
  return url.replace("?_ex=128x128", "").replace("?_ex=128x128", "");
}

export function shortText(input = "", max = 180) {
  const stripped = input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return stripped.length > max ? `${stripped.slice(0, max)}...` : stripped;
}

export function normalizeRakutenItems(items: RakutenApiItemWrapper[], category = "all"): Deal[] {
  const label = categoryLabels[category] || categoryLabels.all;

  return items.map((wrapper, index) => {
    const item = wrapper.Item;
    const pointRate = Number(item.pointRate || 0);
    const price = typeof item.itemPrice === "number" ? item.itemPrice : null;
    const image = cleanImage(item.mediumImageUrls?.[0]?.imageUrl);

    return {
      id: encodeURIComponent(item.itemCode || `${Date.now()}-${index}`),
      store: item.shopName || "Rakuten Shop",
      title: item.itemName,
      jpTitle: item.itemName,
      description: shortText(item.itemCaption || "楽天市場の商品・セール情報です。"),
      discount: pointRate > 1
        ? `ポイント${pointRate}倍`
        : price
          ? `¥${price.toLocaleString("ja-JP")}〜`
          : "セール対象",
      category: label,
      area: "全国",
      priceNote: pointRate > 1 ? "ポイント還元あり" : "楽天市場で確認",
      expires: item.pointRateEndTime ? item.pointRateEndTime.slice(0, 10).replaceAll("-", "/") : "公式サイトで確認",
      url: item.affiliateUrl || item.itemUrl,
      image,
      clicks: 0,
      coupon: pointRate > 1,
      featured: index < 4,
      price,
      reviewAverage: typeof item.reviewAverage === "number" ? item.reviewAverage : null,
      reviewCount: typeof item.reviewCount === "number" ? item.reviewCount : null
    };
  });
}
