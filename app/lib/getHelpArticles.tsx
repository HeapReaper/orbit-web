import { HelpArticlesType } from "@/app/types/helpArticles";

export async function getHelpArticles(): Promise<HelpArticlesType[]> {
  const res = await fetch("https://strapi.botinorbit.com/api/helps?populate=*", {
    next: { revalidate: 60 },
  });

  const data = await res.json();

  if (!data?.data || !Array.isArray(data.data)) return [];

  return data.data.map((item: any) => ({
    title: item.title,
    description: item.description,
    author: item.author || null,
    updatedAt: item.updatedAt,
    contentrich: item.contentrich,
    slug: item.slug,
  }));
}
