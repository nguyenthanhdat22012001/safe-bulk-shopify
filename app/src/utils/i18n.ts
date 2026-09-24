import type { Module } from "i18next";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";

/**
 * The default locale for the app.
 */
const DEFAULT_APP_LOCALE = "en";

/**
 * The supported locales for the app.
 *
 * These should correspond with the JSON files in the `locales` folder.
 *
 * @example
 *   en.json
 *   de.json
 *   fr.json
 * @see Available Shopify Admin languages in the Shopify Help Center:
 * https://help.shopify.com/en/manual/your-account/languages#available-languages
 */
const SUPPORTED_APP_LOCALES = [
  "en",
  "fr",
  "de",
  "ja",
  "es",
  "tr",
  "pt-PT",
  "zh-CN",
];

export const defaultSettingI18n = {
  // debug: import.meta.env.DEV,
  fallbackLng: DEFAULT_APP_LOCALE,
  supportedLngs: SUPPORTED_APP_LOCALES,
  interpolation: {
    // React escapes values by default
    escapeValue: false,
  },
  react: {
    // Wait for the locales to be loaded before rendering the app
    // instead of using a Suspense component
    useSuspense: false,
  },
};

// i18next
//   .use(LanguageDetector)
//   .init({
//     detection: {
//       order: ["localStorage", "querystring", "htmlTag", "sessionStorage", "navigator", "path", "cookie", "subdomain"],
//       lookupQuerystring: "locale",
//     },
//     ...defaultSettingI18n,
//   });

// export default i18next;

// Khởi tạo i18n một lần duy nhất
const initI18n = (customPlugins: unknown[] = []) => {
  if (i18next.isInitialized) return i18next;

  let instance = i18next;

  // Áp dụng các plugin custom (bao gồm initReactI18next + backend)
  customPlugins.forEach((plugin) => {
    instance = instance.use(plugin as Module);
  });

  instance.use(LanguageDetector).init({
    // lng: DEFAULT_APP_LOCALE, // hoặc detect từ shopify / localStorage
    fallbackLng: DEFAULT_APP_LOCALE,
    ns: ["storefront", "translation"],
    defaultNS: "translation",
    interpolation: { escapeValue: false },
    react: {
      useSuspense: true,
    },
    detection: {
      order: [
        "localStorage",
        "querystring",
        "htmlTag",
        "sessionStorage",
        "navigator",
        "path",
        "cookie",
        "subdomain",
      ],
      lookupQuerystring: "locale",
    },
  });

  return instance;
};

function localResourcesToBackend() {
  return resourcesToBackend(async (locale = "" /* , _namespace */) => {
    return (await import(`../locales/${locale}.json`)).default;
  });
}

export { initI18n, localResourcesToBackend };
export default i18next; // export instance để dùng ở nơi cần
