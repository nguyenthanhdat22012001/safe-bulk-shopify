import { LOCALE_FORMAT_NUMBER } from "@/constants/constantGeneral";

export const returnFormatNumber = (value: number) => {
  const numberValue = Number(value);
  if (numberValue === 0) return "0";
  const isFloat = numberValue === value && value % 1 !== 0;
  if (isFloat) return (+numberValue.toFixed(2)).toLocaleString(LOCALE_FORMAT_NUMBER);
  const newValue = numberValue.toLocaleString(LOCALE_FORMAT_NUMBER);
  return newValue;
};

export const formatNumberString = (str: string, type?: "integer" | "float", supportNegative = false) => {
  if (!str.length) return str;

  const isNegative = supportNegative ? str.startsWith("-") : false;

  // Remove non-digit characters
  let numStr = str.replace(/[^0-9.]/g, "");

  // Remove leading zeros
  numStr = numStr.replace(/^0+/, "");

  // If all zeros, return '0'
  if (!numStr.length) {
    return "0";
  }

  // Round to nearest integer if decimal part >= 0.5

  let num = parseFloat(numStr);
  if (!type || type === "integer") {
    num = Math.round(num);
  }

  // Format as a string with comma separators
  const formattedNumStr = (+num.toFixed(2)).toLocaleString(LOCALE_FORMAT_NUMBER);
  return supportNegative && isNegative ? `-${formattedNumStr}` : formattedNumStr;
};

export const returnNumberRemoveComma = (input: string | number) => {
  if (!input || (typeof input === "string" && !input.length)) return NaN;
  // Remove comma
  const numStr = input.toString().replace(/,/g, "");
  return Number(numStr);
};

export const returnFormatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/** format date */
export function formatDateRangeThisMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.toLocaleString("default", { month: "short" });
  const firstDay = 1;
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate(); // Get the last day of the current month

  return `${month} ${firstDay}, ${year} - ${month} ${lastDay}, ${year}`;
}

export function formatDateStringYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
// export function formatDateStringBirthday(dateString: string): string {
//   if (!dateString.length) return "";
//   const [year, month, day] = dateString.split("-");

//   const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//   const monthIndex = parseInt(month, 10) - 1;

//   const formattedMonth = monthNames[monthIndex];
//   const formattedDay = parseInt(day, 10); // Remove leading zeros

//   return `${formattedMonth} ${formattedDay}, ${year}`;
// }

/** end format date */

export function convertCurrency(currency: string): number {
  // Using replace() method
  // to make currency string suitable
  // for parseFloat() to convert

  const hasKilo = currency.includes("K");

  const hasMillion = currency.includes("M");

  const temp = currency.replace(/[^0-9.-]+/g, "");

  if (hasKilo) return parseFloat(temp) * 1000;

  if (hasMillion) return parseFloat(temp) * 1000000;

  // Converting string to float
  // or double and return
  return parseFloat(temp);
}

export function formatNumberIntl({ value, options }: { value: number; options?: Intl.NumberFormatOptions }): string {
  return new Intl.NumberFormat(LOCALE_FORMAT_NUMBER, options).format(value);
}

export function extractCurrencySymbol(moneyFormat: string): string {
  try {
    return moneyFormat
      .replace(/\{\{.*?\}\}/g, "") // Remove {{...}} placeholders
      .replace(/&lt;\/?[a-zA-Z][^>]*?&gt;/g, "") // Strip entity-encoded HTML tags (e.g. &lt;span&gt;)
      .replace(/<[^>]*>/g, "") // Strip actual HTML tags
      .replace(/&amp;/g, "&") // Decode remaining entities
      .replace(/&nbsp;/g, " ")
      .trim();
  } catch (error) {
    console.error("Error extracting currency symbol:", error);
    return "";
  }
}
