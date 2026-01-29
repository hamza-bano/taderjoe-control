import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * A number input that properly handles 0 as a valid value.
 * Standard onChange with parseInt/parseFloat treats empty string and 0 the same way.
 */
export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  className,
  disabled,
}: NumberInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Allow empty field to be typed (will be treated as min or 0)
    if (rawValue === "" || rawValue === "-") {
      onChange(min ?? 0);
      return;
    }

    const parsed = step < 1 ? parseFloat(rawValue) : parseInt(rawValue, 10);
    
    if (isNaN(parsed)) {
      return;
    }

    // Clamp to min/max if provided
    let finalValue = parsed;
    if (min !== undefined && finalValue < min) finalValue = min;
    if (max !== undefined && finalValue > max) finalValue = max;
    
    onChange(finalValue);
  };

  return (
    <Input
      type="number"
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      className={cn("font-mono", className)}
      disabled={disabled}
    />
  );
}
