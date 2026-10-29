/**
 * @param name - collection display name
 * @returns slugified string
 */
export const collectionSlug = (name?: string | null): string =>
  (name || '').replace(/\s+/g, '-').toLowerCase();

export default collectionSlug;
