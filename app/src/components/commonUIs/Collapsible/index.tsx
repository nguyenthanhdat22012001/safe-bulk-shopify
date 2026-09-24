import { useId, type KeyboardEvent, type ReactNode } from "react";

interface IProps {
  isOpen: boolean;
  onToggle: () => void;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
}

const Collapsible = ({
  isOpen,
  onToggle,
  trigger,
  children,
  className = "",
}: IProps) => {
  const panelId = useId();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onToggle();
  };

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="cursor-pointer"
      >
        {trigger}
      </div>
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden" inert={!isOpen}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Collapsible;
