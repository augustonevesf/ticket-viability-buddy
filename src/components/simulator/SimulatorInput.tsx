import React from "react";

interface SimulatorInputProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  prefix?: string;
  step?: number;
  min?: number;
  max?: number;
  error?: string;
  disabled?: boolean;
  allowEmpty?: boolean;
}

export const SimulatorInput: React.FC<SimulatorInputProps> = ({
  label, value, onChange, suffix, prefix, step = 1, min, max, error, disabled, allowEmpty,
}) => {
  const displayValue = allowEmpty && value === 0 ? "" : value;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground tracking-wide">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={displayValue}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "" && allowEmpty) {
              onChange(0);
            } else {
              onChange(parseFloat(raw) || 0);
            }
          }}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          placeholder={allowEmpty ? "0" : undefined}
          className={`w-full bg-input border rounded-xl px-3 py-2.5 text-sm tabular-nums outline-none transition-all
            focus:ring-2 focus:ring-primary/20 focus:border-primary
            ${prefix ? "pl-9" : ""} ${suffix ? "pr-9" : ""}
            ${error ? "border-destructive" : "border-border"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            text-foreground placeholder:text-muted-foreground`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
};

interface ToggleInputProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export const SimulatorToggle: React.FC<ToggleInputProps> = ({ label, checked, onChange }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-200 ${checked ? "bg-primary" : "bg-border"}`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-[2px] w-[27px] h-[27px] rounded-full bg-card shadow-sm transition-transform duration-200 ${checked ? "translate-x-[22px]" : "translate-x-[2px]"}`}
        />
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
};
