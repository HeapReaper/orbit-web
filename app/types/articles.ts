export interface ArticleType {
  id: number;
  title: string;
  description: string;
  Author: { name: string };
  date_created: string;
  slug: string;
  category?: string;
}
