const imageCache = new Map();

async function fetchWikiSummary(title) {
  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
    { headers: { Accept: 'application/json' } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (data.thumbnail?.source) {
    return {
      url: data.thumbnail.source,
      width: data.thumbnail.width,
      height: data.thumbnail.height,
    };
  }
  return null;
}

function buildQueries(city, state, country) {
  const queries = [];
  if (city && state) queries.push(`${city}, ${state}`);
  if (city && country) queries.push(`${city}, ${country}`);
  if (city) queries.push(city);
  return [...new Set(queries)];
}

export async function getCityImage(city, state = '', country = '') {
  if (!city) return null;

  const cacheKey = `${city}|${state}|${country}`.toLowerCase();
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  const queries = buildQueries(city, state, country);
  for (const query of queries) {
    const image = await fetchWikiSummary(query);
    if (image) {
      imageCache.set(cacheKey, image);
      return image;
    }
  }

  imageCache.set(cacheKey, null);
  return null;
}

export function clearCityImageCache() {
  imageCache.clear();
}
