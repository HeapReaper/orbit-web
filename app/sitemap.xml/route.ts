import { NextResponse } from "next/server";

async function getDirectusArticles() {
  const res = await fetch(
    `${process.env.DIRECTUS_URL}/items/Article?fields=slug&limit=-1`,
    { next: { revalidate: 30 } },
  );

  const data = await res.json();
  return data.data.map((item: any) => `/articles/${item.slug}`);
}

async function getDirectusHelpArticles() {
  const res = await fetch(
    `${process.env.DIRECTUS_URL}/items/Help?fields=slug&limit=-1`,
    { next: { revalidate: 30 } },
  );

  const data = await res.json();
  return data.data.map((item: any) => `/help/${item.slug}`);
}

export async function GET() {
  const localRoutes = [
    "",
    "/help",
    "/subscriptions",
    "/servers",
    "/releases",
    "/preview",
  ];

  const articleRoutes = await getDirectusArticles();
  const helpRoutes = await getDirectusHelpArticles();

  const allRoutes = Array.from(
    new Set([...localRoutes, ...articleRoutes, ...helpRoutes]),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) =>
      `<url><loc>${process.env.NEXT_PUBLIC_BASE_URL}${route}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
  )
  .join("")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
