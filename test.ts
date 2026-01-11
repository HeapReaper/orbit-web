async function getArticles() {
  const res = await fetch(
    `${process.env.DIRECTUS_URL}/items/Article?fields=*,Author.*,Category.*`,
    {
      next: { revalidate: 30 },
    },
  );

  const data = await res.json();

  return data.data;
}

await getArticles();
