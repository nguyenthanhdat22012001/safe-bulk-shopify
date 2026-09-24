// import type { TPreviewWarningFilter } from "@/types/csv";
// import { useTranslation } from "react-i18next";

// interface IProps {
//   warningFilter: TPreviewWarningFilter | undefined;
//   onChangeWarningFilter: (value: TPreviewWarningFilter | undefined) => void;
// }

// const PreviewFilterBar = ({
//   warningFilter,
//   onChangeWarningFilter,
// }: IProps) => {
//   const { t } = useTranslation();

//   return (
//     <s-stack direction="inline" gap="base" alignItems="end">
//       <s-select
//         label={t("csv_import.label_filter_warning")}
//         value={warningFilter ?? "null"}
//         onInput={(e) => {
//           const value = e.currentTarget.value;
//           onChangeWarningFilter(
//             value === "null" ? undefined : (value as TPreviewWarningFilter),
//           );
//         }}
//       >
//         <s-option value="null">
//           {t("csv_import.option_filter_warning_all")}
//         </s-option>
//         <s-option value="any">
//           {t("csv_import.option_filter_warning_any")}
//         </s-option>
//         <s-option value="none">
//           {t("csv_import.option_filter_warning_none")}
//         </s-option>
//         <s-option value="skippable">
//           {t("csv_import.option_filter_warning_skippable")}
//         </s-option>
//         <s-option value="will_skip">
//           {t("csv_import.option_filter_warning_will_skip")}
//         </s-option>
//       </s-select>
//     </s-stack>
//   );
// };

// export default PreviewFilterBar;
