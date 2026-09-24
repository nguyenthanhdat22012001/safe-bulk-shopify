import TagComboField from "@/components/commonUIs/TagComboField";
import {
  ATTRIBUTE_OPTIONS,
  MODE_OPTIONS_BY_FIELD,
  ROUNDING_RULE_OPTIONS,
} from "@/constants/editWizard";
import WizardStepper from "@/features/EditWizard/components/WizardStepper";
import { useEditWizardContext } from "@/hooks/editWizard";
import type {
  IChangeRule,
  TChangeField,
  TChangeMode,
  TRoundingRule,
} from "@/types/editWizard";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const DEFAULT_MODE_BY_FIELD: Record<TChangeField, TChangeMode> = {
  price: "percent_increase",
  compare_at_price: "percent_increase",
  tags: "add",
  inventory_quantity: "increase",
  status: "set_value",
  find_replace: "find_replace",
};

const Step2ActionForm = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useEditWizardContext();

  const [field, setField] = useState<TChangeField>(
    state.changeRule?.field ?? "price",
  );
  const [mode, setMode] = useState<TChangeMode>(
    state.changeRule?.mode ?? DEFAULT_MODE_BY_FIELD.price,
  );
  const [value, setValue] = useState<string>(
    state.changeRule?.value?.toString() ?? "",
  );
  const [findValue, setFindValue] = useState(state.changeRule?.find ?? "");
  const [replaceValue, setReplaceValue] = useState(
    state.changeRule?.replace ?? "",
  );
  const [roundingRule, setRoundingRule] = useState<TRoundingRule>(
    state.changeRule?.rounding_mode ?? "none",
  );
  const [tagsValue, setTagsValue] = useState<string[]>(
    field === "tags" ? (state.changeRule?.tags ?? []) : [],
  );

  const modeOptions = MODE_OPTIONS_BY_FIELD[field];
  const isPriceField = field === "price" || field === "compare_at_price";
  const isTagsField = field === "tags";
  const isInventoryField = field === "inventory_quantity";
  const isFindReplaceMode = mode === "find_replace";

  const showPercentField =
    isPriceField &&
    (mode === "percent_increase" || mode === "percent_decrease");
  const showMoneyField =
    isPriceField &&
    (mode === "fixed_increase" ||
      mode === "fixed_decrease" ||
      mode === "set_value");
  const showInventoryNumberField =
    isInventoryField &&
    (mode === "increase" || mode === "decrease" || mode === "set_value");
  const showTagsInput = isTagsField && !isFindReplaceMode;
  const showFindReplaceInputs = isFindReplaceMode;

  const helpTextKey = showPercentField
    ? "edit_wizard.inline_help_percent"
    : showMoneyField
      ? "edit_wizard.inline_help_money"
      : showInventoryNumberField
        ? "edit_wizard.inline_help_inventory"
        : showTagsInput
          ? "edit_wizard.inline_help_tags"
          : showFindReplaceInputs
            ? "edit_wizard.inline_help_find_replace"
            : undefined;

  const handleFieldChange = (nextField: TChangeField) => {
    setField(nextField);
    setMode(DEFAULT_MODE_BY_FIELD[nextField]);
    setValue("");
    setTagsValue([]);
    setFindValue("");
    setReplaceValue("");
  };

  const isValueValid = () => {
    if (showTagsInput) return tagsValue.length > 0;
    if (showFindReplaceInputs) return findValue.trim().length > 0;
    return value.trim().length > 0;
  };

  const buildChangeRule = (): IChangeRule => ({
    field,
    mode,
    value: showTagsInput ? undefined : value,
    tags: showTagsInput ? tagsValue : undefined,
    find: showFindReplaceInputs ? findValue : undefined,
    replace: showFindReplaceInputs ? replaceValue : undefined,
    rounding_mode: isPriceField ? roundingRule : undefined,
  });

  const handleNext = () => {
    dispatch({ type: "SET_CHANGE_RULE", payload: buildChangeRule() });
    dispatch({ type: "GO_TO_STEP", payload: 3 });
  };

  const handlePrevious = () => {
    dispatch({ type: "SET_CHANGE_RULE", payload: buildChangeRule() });
    dispatch({ type: "GO_TO_STEP", payload: 1 });
  };

  return (
    <s-page heading={t("edit_wizard.step2_heading")}>
      <div className="flex flex-col gap-5">
        <WizardStepper currentStep={2} />
        <s-section>
          <s-stack gap="base">
            <s-select
              label={t("edit_wizard.step2_attribute_label")}
              value={field}
              onInput={(e) =>
                handleFieldChange(e.currentTarget.value as TChangeField)
              }
            >
              {ATTRIBUTE_OPTIONS.map((option) => (
                <s-option key={option.value} value={option.value}>
                  {t(option.labelI18nKey)}
                </s-option>
              ))}
            </s-select>

            <s-select
              label={t("edit_wizard.step2_mode_label")}
              value={mode}
              onInput={(e) => setMode(e.currentTarget.value as TChangeMode)}
            >
              {modeOptions.map((option) => (
                <s-option key={option.value} value={option.value}>
                  {t(option.labelI18nKey)}
                </s-option>
              ))}
            </s-select>

            {showTagsInput && (
              <TagComboField
                label={t("edit_wizard.step2_value_label")}
                placeholder={t("edit_wizard.filter_tags_placeholder")}
                value={tagsValue}
                onChange={setTagsValue}
              />
            )}

            {showFindReplaceInputs && (
              <>
                <s-text-field
                  label={t("edit_wizard.step2_find_label")}
                  value={findValue}
                  onInput={(e) => setFindValue(e.currentTarget.value)}
                />
                <s-text-field
                  label={t("edit_wizard.step2_replace_label")}
                  value={replaceValue}
                  onInput={(e) => setReplaceValue(e.currentTarget.value)}
                />
              </>
            )}

            {showPercentField && (
              <s-number-field
                label={t("edit_wizard.step2_value_label")}
                suffix="%"
                value={value}
                onInput={(e) => setValue(e.currentTarget.value)}
              />
            )}

            {showMoneyField && (
              <s-money-field
                label={t("edit_wizard.step2_value_label")}
                value={value}
                onInput={(e) => setValue(e.currentTarget.value)}
              />
            )}

            {showInventoryNumberField && (
              <s-number-field
                label={t("edit_wizard.step2_value_label")}
                value={value}
                onInput={(e) => setValue(e.currentTarget.value)}
              />
            )}

            {helpTextKey && (
              <s-text color="subdued">{t(helpTextKey)}</s-text>
            )}

            {isPriceField && (
              <s-select
                label={t("edit_wizard.step2_rounding_label")}
                value={roundingRule}
                onInput={(e) =>
                  setRoundingRule(e.currentTarget.value as TRoundingRule)
                }
              >
                {ROUNDING_RULE_OPTIONS.map((option) => (
                  <s-option key={option.value} value={option.value}>
                    {t(option.labelI18nKey)}
                  </s-option>
                ))}
              </s-select>
            )}
          </s-stack>
        </s-section>
      </div>

      <s-button
        slot="primary-action"
        disabled={!isValueValid()}
        onClick={handleNext}
      >
        {t("edit_wizard.button_next_preview")}
      </s-button>
      <s-button
        slot="secondary-actions"
        variant="secondary"
        onClick={handlePrevious}
      >
        {t("edit_wizard.button_previous")}
      </s-button>
    </s-page>
  );
};

export default Step2ActionForm;
