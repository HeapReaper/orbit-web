import { ArticleType } from "@/app/types/articles";

export async function getLatestArticles(): Promise<ArticleType[]> {
  const res = await fetch(
    "https://strapi.botinorbit.com/api/articles?populate=*&sort=createdAt:desc&pagination[limit]=100",
    { next: { revalidate: 60 } }
  );

  const data = await res.json();
  if (!data?.data || !Array.isArray(data.data)) return [];
  return data.data.map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    author: item.author || null,
    updatedAt: item.updatedAt,
    slug: item.slug,
    category: item.category?.name || "Uncategorized",
  }));
}
