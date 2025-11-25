
export interface ArticleType {
  id: number;
  title: string;
  description: string;
  author?: { name: string; };
  updatedAt: string;
  slug: string;
  category?: string;
}
