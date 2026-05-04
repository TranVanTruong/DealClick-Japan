import { NextRequest, NextResponse } from "next/server";
import { keywordForCategory, normalizeRakutenItems } from "@/lib/rakuten";

export const dynamic = "force-dynamic";

const RAKUTEN_ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";

export async function GET(request: NextRequest) {
  const appId = process.env.RAKUTEN_APP_ID;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;

  if (!appId || !accessKey) {
    return NextResponse.json(
      {
        error: "Missing Rakuten credentials",
        message: "Set both RAKUTEN_APP_ID and RAKUTEN_ACCESS_KEY in .env.local or Vercel Environment Variables."
      },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category") || "all";
  const keyword = searchParams.get("keyword") || keywordForCategory(category);
  const hits = searchParams.get("hits") || "24";
  const page = searchParams.get("page") || "1";
  const sort = searchParams.get("sort") || "-reviewCount";

  const params = new URLSearchParams({
    applicationId: appId,
    accessKey,
    format: "json",
    keyword,
    hits,
    page,
    sort,
    imageFlag: "1",
    availability: "1",
    formatVersion: "2"
  });

  if (affiliateId) {
    params.set("affiliateId", affiliateId);
  }

  const response = await fetch(`${RAKUTEN_ENDPOINT}?${params.toString()}`, {
    headers: { "Accept": "application/json" },
    next: { revalidate: 1800 }
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: "Rakuten API request failed", status: response.status, detail },
      { status: response.status }
    );
  }

  const data = await response.json();
  const deals = normalizeRakutenItems(data.Items || [], category);

  return NextResponse.json({
    source: "Rakuten Ichiba Item Search API",
    keyword,
    category,
    count: deals.length,
    deals
  });
}
