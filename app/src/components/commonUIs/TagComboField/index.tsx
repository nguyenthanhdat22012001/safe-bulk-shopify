import { useState } from "react";

interface IProps {
  label: string;
  placeholder?: string;
  value: string[];
  onChange: (tags: string[]) => void;
}

/**
 * Freeform tag entry — this app has no Combobox primitive and Shopify's
 * Admin API has no simple "list all distinct tags" query, so there is no
 * live suggestion source (see design doc).
 */
const TagComboField = ({ label, placeholder, value, onChange }: IProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || value.includes(trimmed)) {
      setInputValue("");
      return;
    }
    onChange([...value, trimmed]);
    setInputValue("");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleAddTag();
  };

  const handleRemoveTag = (tag: string) => {
    onChange(value.filter((existing) => existing !== tag));
  };

  return (
    <s-stack gap="small-200">
      <form onSubmit={handleSubmit}>
        <s-search-field
          label={label}
          placeholder={placeholder}
          value={inputValue}
          onInput={(e) => setInputValue(e.currentTarget.value)}
          onBlur={handleAddTag}
        />
      </form>
      {value.length > 0 && (
        <s-stack direction="inline" gap="small-200">
          {value.map((tag) => (
            <s-clickable-chip
              key={tag}
              removable={true}
              onRemove={() => handleRemoveTag(tag)}
            >
              {tag}
            </s-clickable-chip>
          ))}
        </s-stack>
      )}
    </s-stack>
  );
};

export default TagComboField;
