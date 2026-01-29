import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface ConditionEditorProps {
  conditions: string[];
  onChange: (conditions: string[]) => void;
  placeholder?: string;
}

export function ConditionEditor({
  conditions,
  onChange,
  placeholder = "e.g., EMA_21 > EMA_50",
}: ConditionEditorProps) {
  const addCondition = () => {
    onChange([...conditions, ""]);
  };

  const removeCondition = (index: number) => {
    const updated = [...conditions];
    updated.splice(index, 1);
    onChange(updated);
  };

  const updateCondition = (index: number, value: string) => {
    const updated = [...conditions];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {conditions.map((condition, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={condition}
            onChange={(e) => updateCondition(index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 font-mono text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeCondition(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addCondition}
        className="w-full border-dashed"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Condition
      </Button>
    </div>
  );
}
