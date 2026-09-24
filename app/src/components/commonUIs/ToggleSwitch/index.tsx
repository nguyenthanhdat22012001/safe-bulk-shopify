import { memo } from "react";
import styles from "./styles.module.scss";

interface toggleSwitchProps {
  label?: string;
  isActive: boolean;
  classAdds?: string;
  disabled?: boolean;
  onChangeActive: (isCheck: boolean) => void;
  loading?: boolean;
}

const ToggleSwitch = memo(
  ({
    label,
    isActive = false,
    onChangeActive,
    disabled = false,
    classAdds = "",
    loading = false,
  }: toggleSwitchProps) => {
    return (
      <div className={`${styles.wrapper} ${classAdds || ""}`}>
        {loading ? (
          <s-stack>
            <div className="h-5">
              <s-spinner
                accessibilityLabel="ToggleSwitch"
                size="base"
              ></s-spinner>
            </div>
          </s-stack>
        ) : (
          <>
            <button
              className={styles.switcher}
              type="button"
              role="switch"
              aria-checked={isActive}
              disabled={disabled}
              onClick={(event) => {
                event.preventDefault();
                onChangeActive(!isActive);
              }}
            >
              <div className={styles.cursor} />
            </button>
            <span className={styles.prefix} aria-hidden={!label}>
              {label}
            </span>
          </>
        )}
      </div>
    );
  },
);

export default ToggleSwitch;
