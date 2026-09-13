const GA_ID_PATTERN = /^G-[A-Z0-9]+$/;

export function getGaId() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  if (!gaId || !GA_ID_PATTERN.test(gaId)) return undefined;
  return gaId;
}
