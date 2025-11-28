export interface moduleType {
  name: string;
  url: string;
  description: string;
  tier: "free" | "freemium" | "premium";
  enabled: boolean;
  inDevelopment: boolean;
  category: string;
}