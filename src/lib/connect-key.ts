export const formatConnectKey = (key: string): string => {
  const clean = key.replace(/-/g, "");
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}`;
};
