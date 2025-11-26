import { NextResponse } from "next/server";

async function getStrapiArticles() {
  const res = await fetch(
    `${process.env.STRAPI_URL}/api/articles?fields=slug&pagination[pageSize]=100`,
    { next: { revalidate: 60 } }
  );

  const data = await res.json();
  return data.data.map((item: any) => `/articles/${item.slug}`);
}

async function getStrapiHelpArticles() {
  const res = await fetch(
    `${process.env.STRAPI_URL}/api/helps?fields=slug&pagination[pageSize]=100`,
    { next: { revalidate: 60 } }
  );

  const data = await res.json();
  return data.data.map((item: any) => `/help/${item.slug}`);
}

export async function GET() {
  const localRoutes = ["", "/help", "/subscriptions", "/servers", "/releases"];

  const articleRoutes = await getStrapiArticles();
  const helpRoutes = await getStrapiHelpArticles();

  // Combine all routes and remove duplicates
  const allRoutes = Array.from(new Set([...localRoutes, ...articleRoutes, ...helpRoutes]));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
    .map(
      (route) => `<url><loc>${process.env.NEXT_PUBLIC_BASE_URL}${route}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}