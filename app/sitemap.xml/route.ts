import { NextResponse } from "next/server";

export async function GET() {
  const localRoutes = [
    "",
    "/help",
    "/subscriptions",
    "/servers",
    "/releases",
    "/preview",
  ];


  const allRoutes = Array.from(
    new Set([...localRoutes]),
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
