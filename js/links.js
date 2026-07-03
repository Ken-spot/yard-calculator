// Store search links. These open the retailer's search for a material so the
// user sees live local prices — no scraping, nothing to break.

export function storeLinks(query, settings = {}) {
  const q = encodeURIComponent(query);
  const links = [
    { name: 'Home Depot', short: 'HD', url: `https://www.homedepot.com/s/${q}` },
    { name: "Lowe's", short: "Lowe's", url: `https://www.lowes.com/search?searchTerm=${q}` },
  ];
  if (settings.showMenards) {
    links.push({ name: 'Menards', short: 'Menards', url: `https://www.menards.com/main/search.html?search=${q}` });
  }
  return links;
}
