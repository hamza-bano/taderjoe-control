import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MultiSelectProps<T extends string> {
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect<T extends string>({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps<T>) {
  const toggleOption = (option: T) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const removeOption = (option: T) => {
    onChange(value.filter((v) => v !== option));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start h-auto min-h-10 py-2",
            className
          )}
        >
          {value.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {value.map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {v}
                  <button
                    type="button"
                    className="hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(v);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2 bg-popover" align="start">
        <div className="space-y-1">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-sm text-left rounded-md transition-colors",
                value.includes(option)
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
              onClick={() => toggleOption(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
