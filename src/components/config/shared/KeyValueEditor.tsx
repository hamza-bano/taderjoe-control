import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ValueType = "string" | "number" | "boolean" | "array";

interface KeyValueEditorProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  className?: string;
}

function parseArrayValue(input: string): number[] {
  return input
    .split(",")
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));
}

function formatArrayValue(arr: number[]): string {
  return arr.join(", ");
}

function getValueType(val: unknown): ValueType {
  if (Array.isArray(val)) return "array";
  if (typeof val === "boolean") return "boolean";
  if (typeof val === "number") return "number";
  return "string";
}

export function KeyValueEditor({ value, onChange, className }: KeyValueEditorProps) {
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState<ValueType>("number");

  const entries = Object.entries(value);

  const handleAddEntry = () => {
    if (!newKey.trim()) return;
    const key = newKey.trim();
    if (key in value) return;

    let defaultValue: unknown;
    switch (newType) {
      case "number":
        defaultValue = 0;
        break;
      case "boolean":
        defaultValue = false;
        break;
      case "array":
        defaultValue = [];
        break;
      default:
        defaultValue = "";
    }

    onChange({ ...value, [key]: defaultValue });
    setNewKey("");
  };

  const handleRemoveEntry = (key: string) => {
    const newValue = { ...value };
    delete newValue[key];
    onChange(newValue);
  };

  const handleValueChange = (key: string, newVal: unknown, type: ValueType) => {
    let parsedValue: unknown = newVal;
    
    switch (type) {
      case "number":
        parsedValue = parseFloat(newVal as string) || 0;
        break;
      case "boolean":
        parsedValue = newVal === "true";
        break;
      case "array":
        parsedValue = parseArrayValue(newVal as string);
        break;
      default:
        parsedValue = newVal;
    }

    onChange({ ...value, [key]: parsedValue });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {entries.map(([key, val]) => {
        const type = getValueType(val);
        return (
          <div key={key} className="flex items-center gap-2">
            <div className="w-28 text-sm font-mono text-muted-foreground truncate">
              {key}
            </div>
            {type === "boolean" ? (
              <Select
                value={String(val)}
                onValueChange={(v) => handleValueChange(key, v, type)}
              >
                <SelectTrigger className="flex-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">true</SelectItem>
                  <SelectItem value="false">false</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={type === "array" ? formatArrayValue(val as number[]) : String(val)}
                onChange={(e) => handleValueChange(key, e.target.value, type)}
                placeholder={type === "array" ? "1, 2, 3" : ""}
                className="flex-1 h-9"
              />
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemoveEntry(key)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Parameter name"
          className="flex-1 h-9"
        />
        <Select value={newType} onValueChange={(v) => setNewType(v as ValueType)}>
          <SelectTrigger className="w-24 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="number">number</SelectItem>
            <SelectItem value="string">string</SelectItem>
            <SelectItem value="boolean">boolean</SelectItem>
            <SelectItem value="array">array</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-9 w-9"
          onClick={handleAddEntry}
          disabled={!newKey.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
