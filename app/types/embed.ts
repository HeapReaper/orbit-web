export interface EmbedData {
  color?: string;
  title?: string;
  titleUrl?: string;
  description?: string;

  author?: {
    name?: string;
    icon?: string;
  };

  thumbnail?: string;
  image?: string;

  footer?: {
    text?: string;
    icon?: string;
  };

  fields?: {
    name: string;
    value: string;
    inline?: boolean;
  }[];
}
