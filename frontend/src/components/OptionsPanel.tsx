import React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { buttonClass } from "@/theme/components";
import { Sliders } from "lucide-react";
import { DateRange } from "react-day-picker";

export type DimReductionMethod = "umap" | "pca" | "tsne";

interface OptionsPanelProps {
  selectedMethod: DimReductionMethod;
  onMethodChange: (method: DimReductionMethod) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({
  selectedMethod,
  onMethodChange,
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <Collapsible className="my-4">
      <CollapsibleTrigger
        className={`${buttonClass} mb-2 flex items-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors duration-200 rounded-sm`}
      >
        <Sliders className="w-5 h-5" />
        <span>Search & Visualization Options</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="p-4 border rounded-sm">
        <h2 className="text-lg font-bold mb-2">Visualization Options</h2>
        <p className="mb-2 text-sm">
          Dimensionality Reduction: Select a method to change the scatter plot view.
        </p>
        <Select value={selectedMethod} onValueChange={onMethodChange}>
          <SelectTrigger className="w-full rounded-md">
            <SelectValue placeholder="Select a method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="umap">UMAP</SelectItem>
            <SelectItem value="pca">PCA</SelectItem>
            <SelectItem value="tsne">t‑SNE</SelectItem>
          </SelectContent>
        </Select>
        {/* 日付フィルタリングオプション */}
        <div className="mt-4">
          <p className="mb-2 text-sm">Filter by Date Range:</p>
          <DatePickerWithRange
            initialDateFrom={dateRange?.from || new Date(2025, 3, 26)}
            initialDateTo={dateRange?.to || new Date(2025, 4, 1)}
            onUpdate={({ range }) => onDateRangeChange(range)}
          />
        </div>
        {/* 今後、他のフィルタオプションもここに追加可能 */}
      </CollapsibleContent>
    </Collapsible>
  );
};

