import { useShopStore } from "@/stores/shopStore";
import i18next from "@/utils/i18n";
import { I18nContext, I18nManager } from "@shopify/react-i18n";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { type PropsWithChildren } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * @description load dayjs locale
 * @note: tạm thời giữ vì có lỗi khi chuyển ngôn ngữ từ pt sang pt-PT của polaris.
 *  // mapToSupportedLocaleDayjs(locale);
    // dayjs.tz(timezone).locale(locale);
    // {dayjs(start).locale(i18next.language).format(formatTime)}
 * hàm i18n.formatDate(start, {
              dateStyle: "medium"
            }) 
  không format được khi locale là pt-PT. đang trả về định dạng 6/04/2025 mong muốn là về dạng 4 de abril de 2024
  */

/**
 * @description I18nPolarisProvider is a provider for i18n polaris for format currency, date, number, etc.
 */
const I18nPolarisProvider = ({ children }: PropsWithChildren) => {
  const timezone = useShopStore((state) => state.shopInfo?.timezone);

  let isValidTimezone = true;
  try {
    // mapToSupportedLocaleDayjs(locale);
    // dayjs.tz(timezone).locale(locale);
    dayjs.tz(timezone);
  } catch (_) {
    isValidTimezone = false;
  }

  const i18nManager = new I18nManager({
    locale: i18next.language || "en",
    fallbackLocale: "en",
    timezone: isValidTimezone
      ? timezone
      : Intl.DateTimeFormat().resolvedOptions().timeZone,
    onError(error) {
      console.error(error);
    },
  });

  i18next.on("languageChanged", (lng) => {
    // mapToSupportedLocaleDayjs(lng);
    // dayjs.locale(lng);
    i18nManager.update({ locale: lng });
  });

  if (i18nManager.loading) return <></>;

  return (
    <I18nContext.Provider value={i18nManager}>{children}</I18nContext.Provider>
  );
};

export default I18nPolarisProvider;
