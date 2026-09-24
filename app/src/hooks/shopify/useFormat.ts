import { useShopStore } from "@/stores/shopStore";
import {
  type CurrencyFormatOptions,
  type DateStyle,
  useI18n,
} from "@shopify/react-i18n";
import { useCallback } from "react";

export const useFormat = () => {
  const currency = useShopStore((state) => state.shopInfo?.currency);

  const [i18n] = useI18n();

  const returnFormatCurrency = useCallback(
    (
      value: number,
      options?: { form?: CurrencyFormatOptions["form"]; precision?: number },
    ) => {
      // Fallback to USD if currency is undefined or empty
      const safeCurrency =
        currency && currency.trim() !== "" ? currency : "USD";
      return i18n.formatCurrency(value, {
        currency: safeCurrency,
        form: options?.form,
        precision: options?.precision ?? 0,
      });
    },
    [i18n, currency],
  );

  const returnFormatDate = useCallback(
    (
      value: string | Date,
      option?: Intl.DateTimeFormatOptions & {
        style?: DateStyle | undefined;
      },
    ) => {
      const valueString =
        typeof value === "string"
          ? value.length
            ? new Date(value)
            : new Date()
          : value;

      const newValue = i18n.formatDate(valueString, option);
      return newValue;
    },
    [i18n],
  );

  const returnFormatDateRange = useCallback(
    (startDate: string | Date, endDate: string | Date) => {
      const formattedStartDate = returnFormatDate(startDate, {
        dateStyle: "medium",
      });
      const formattedEndDate = returnFormatDate(endDate, {
        dateStyle: "medium",
      });
      return `${formattedStartDate} – ${formattedEndDate}`;
    },
    [returnFormatDate],
  );

  return {
    returnFormatCurrency,
    returnFormatDate,
    returnFormatDateRange,
  };
};
