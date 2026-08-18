/**
 * Dynamic rotating token generator and validator for Developer Workspace
 */

const STORAGE_KEY = 'dev_ephemeral_token';

export const generateDevToken = () => {
  const segment1 = Math.random().toString(36).substring(2, 8);
  const segment2 = Math.random().toString(36).substring(2, 8);
  const token = `dev-${segment1}-${segment2}`;
  sessionStorage.setItem(STORAGE_KEY, token);
  return token;
};

export const getOrCreateDevToken = () => {
  const existing = sessionStorage.getItem(STORAGE_KEY);
  if (existing && isValidDevToken(existing)) {
    return existing;
  }
  return generateDevToken();
};

export const rotateDevToken = () => {
  return generateDevToken();
};

export const isValidDevToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  return /^dev-[a-z0-9]{4,10}-[a-z0-9]{4,10}$/i.test(token);
};
