const STORAGE_KEY_PREFIX = "welcome_banner_dismissed_";

export const isWelcomeBannerDismissed = (shopId: number): boolean =>
  localStorage.getItem(`${STORAGE_KEY_PREFIX}${shopId}`) === "true";

export const dismissWelcomeBanner = (shopId: number): void => {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${shopId}`, "true");
};
