import { useRef, type KeyboardEvent } from "react";

export interface ITabItem {
  value: string;
  label: string;
}

interface IProps {
  items: ITabItem[];
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel?: string;
}

const Tabs = ({ items, value, onChange, accessibilityLabel }: IProps) => {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusTab = (index: number) => {
    const nextItem = items[index];
    onChange(nextItem.value);
    tabRefs.current[nextItem.value]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTab((index + 1) % items.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTab((index - 1 + items.length) % items.length);
    }
  };

  return (
    <div role="tablist" aria-label={accessibilityLabel} className="flex gap-6 border-b border-neutral-border">
      {items.map((item, index) => {
        const isActive = item.value === value;

        return (
          <button
            key={item.value}
            ref={(el) => {
              tabRefs.current[item.value] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`min-h-11 cursor-pointer border-b-2 px-3 pb-3 pt-2 text-[13px] font-medium -mb-px transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 rounded-sm ${
              isActive
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-subdued hover:text-brand-primary"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
