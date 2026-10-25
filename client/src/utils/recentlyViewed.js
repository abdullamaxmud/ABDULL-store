// Recently viewed products, kept per-browser in localStorage.
const KEY = 'abdull_recently_viewed';
const MAX_ITEMS = 12;
const EVENT = 'abdull:recently-viewed';

export const getRecentlyViewed = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
};

/** Store a compact snapshot of the product (enough to render a ProductCard). */
export const addRecentlyViewed = (product) => {
  if (!product?._id) return;
  const snapshot = {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    price: product.price,
    discountPrice: product.discountPrice,
    images: (product.images || []).slice(0, 2),
    rating: product.rating,
    numReviews: product.numReviews,
    stock: product.stock,
    colors: product.colors || [],
    sizes: product.sizes || [],
    soldCount: product.soldCount,
  };
  const list = [snapshot, ...getRecentlyViewed().filter((p) => p._id !== product._id)].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Storage full or blocked — recently viewed is a convenience, so ignore.
  }
};

export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // ignore
  }
};

export const RECENTLY_VIEWED_EVENT = EVENT;
