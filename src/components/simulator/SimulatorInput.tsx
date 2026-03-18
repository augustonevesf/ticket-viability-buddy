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
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
          className={`w-full bg-input border rounded-md px-3 py-2 text-sm tabular-nums outline-none transition-all
            focus:ring-1 focus:ring-ring
            ${prefix ? "pl-8" : ""} ${suffix ? "pr-8" : ""}
            ${error ? "border-destructive" : "border-border"}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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

interface TextInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mask?: "cnpj";
}

const applyCnpjMask = (v: string) => {
  const digits = v.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

export const SimulatorTextInput: React.FC<TextInputProps> = ({
  label, value, onChange, placeholder, mask,
}) => {
  const handleChange = (raw: string) => {
    if (mask === "cnpj") {
      onChange(applyCnpjMask(raw));
    } else {
      onChange(raw);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm outline-none transition-all focus:ring-1 focus:ring-ring"
      />
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
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </div>
      <span className="text-sm text-secondary-foreground">{label}</span>
    </label>
  );
};
