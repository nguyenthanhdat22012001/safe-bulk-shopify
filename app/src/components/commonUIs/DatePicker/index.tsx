import { useId, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useFormat } from "@/hooks/shopify/useFormat";

interface IProps {
  type?: "single" | "range";
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
}

const getDefaultView = (value: string) => {
  const [start] = value.split("--");
  return start && start.length >= 7 ? start.slice(0, 7) : undefined;
};

const DatePicker = ({
  type = "single",
  label,
  value,
  onChange,
  placeholder,
  name,
  disabled = false,
}: IProps) => {
  const { t } = useTranslation();
  const { returnFormatDate, returnFormatDateRange } = useFormat();
  const popoverId = useId();
  const popoverRef = useRef<HTMLElementTagNameMap["s-popover"]>(null);

  const displayText = useMemo(() => {
    const emptyText = placeholder ?? t("common.txt_select_date");

    if (!value) return emptyText;

    if (type === "range") {
      const [start, end] = value.split("--");
      return start && end ? returnFormatDateRange(start, end) : emptyText;
    }

    return returnFormatDate(value, { dateStyle: "medium" });
  }, [value, type, placeholder, t, returnFormatDate, returnFormatDateRange]);

  const defaultView = useMemo(() => getDefaultView(value), [value]);

  return (
    <s-stack>
      <s-text>{label}</s-text>
      <s-button
        commandFor={popoverId}
        icon="calendar"
        variant="secondary"
        accessibilityLabel={label}
        disabled={disabled}
        inlineSize="fill"
      >
        {displayText}
      </s-button>
      <s-popover id={popoverId} ref={popoverRef}>
        <s-box padding="base">
          <s-date-picker
            type={type}
            name={name}
            value={value}
            defaultView={defaultView}
            onChange={(e) => {
              onChange(e.currentTarget.value);
              popoverRef.current?.hidePopover();
            }}
          />
        </s-box>
      </s-popover>
    </s-stack>
  );
};

export default DatePicker;
