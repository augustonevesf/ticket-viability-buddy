import React, { useState, useEffect } from "react";

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
  variant?: "default" | "cost" | "green" | "edited";
}

function parseBR(raw: string): number {
  let normalized = raw.trim();
  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma && hasDot) {
    const lastComma = normalized.lastIndexOf(",");
    const lastDot = normalized.lastIndexOf(".");
    if (lastComma > lastDot) {
      normalized = normalized.split(".").join("").replace(",", ".");
    } else {
      normalized = normalized.split(",").join("");
    }
  } else if (hasComma) {
    normalized = normalized.replace(",", ".");
  }

  return parseFloat(normalized);
}

function formatBRL(num: number): string {
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const SimulatorInput: React.FC<SimulatorInputProps> = ({
  label, value, onChange, suffix, prefix, step = 1, min, max, error, disabled, allowEmpty, variant = "default",
}) => {
  const isCurrency = prefix === "R$";

  const [rawText, setRawText] = useState<string>(() => {
    if (allowEmpty && value === 0) return "";
    return isCurrency ? formatBRL(value) : String(value);
  });

  useEffect(() => {
    const parsed = parseBR(rawText);
    const isEqual = !isNaN(parsed) && Math.abs(parsed - value) < 0.00001;
    if (!isEqual) {
      if (allowEmpty && value === 0) {
        setRawText("");
      } else {
        setRawText(isCurrency ? formatBRL(value) : String(value));
      }
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "" || raw === "-") {
      setRawText(raw);
      if (allowEmpty) onChange(0);
      return;
    }
    const num = parseBR(raw);
    if (!isNaN(num)) {
      let clamped = num;
      if (max !== undefined && num > max) clamped = max;
      else if (min !== undefined && num < min) clamped = min;
      if (clamped !== num) {
        setRawText(String(clamped));
      } else {
        setRawText(raw);
      }
      onChange(clamped);
    } else {
      setRawText(raw);
    }
  };

  const handleBlur = () => {
    if (rawText === "" || rawText === "-") {
      setRawText(allowEmpty ? "" : (isCurrency ? "0,00" : "0"));
      return;
    }
    const num = parseBR(rawText);
    if (!isNaN(num)) {
      setRawText(isCurrency ? formatBRL(num) : String(num));
    }
  };

  const variantStyles = {
    default: "bg-input border-border",
    cost: "bg-muted/60 border-border/60",
    green: "bg-emerald-500/10 border-emerald-500/40",
    edited: "bg-muted/40 border-muted-foreground/30",
  };

  const labelColor = variant === "green"
    ? "text-emerald-600 dark:text-emerald-400"
    : variant === "cost"
      ? "text-muted-foreground/70"
      : "text-muted-foreground";

  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-xs font-medium tracking-wide ${labelColor}`}>{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{prefix}</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={rawText}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={allowEmpty ? "0" : undefined}
          className={`w-full border rounded-xl px-3 py-2.5 text-sm tabular-nums outline-none transition-all
            focus:ring-2 focus:ring-primary/20 focus:border-primary
            ${prefix ? "pl-9" : ""} ${suffix ? "pr-9" : ""}
            ${error ? "border-destructive" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${variantStyles[variant]}
            text-foreground placeholder:text-muted-foreground`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">{suffix}</span>
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
}

export const SimulatorTextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-muted-foreground tracking-wide">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-input border border-border rounded-xl px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground"
    />
  </div>
);

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
