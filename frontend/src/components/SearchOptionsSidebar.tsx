import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

export type DimReductionMethod = "umap" | "pca" | "tsne";

interface SearchOptionsSidebarProps {
  selectedMethod: DimReductionMethod;
  onMethodChange: (method: DimReductionMethod) => void;
  // 今後、他の検索フィルタ（例: 開催日程など）もここに追加可能
}

export const SearchOptionsSidebar: React.FC<SearchOptionsSidebarProps> = ({
  selectedMethod,
  onMethodChange,
}) => {
  return (
    <Sidebar className="h-full">
      <SidebarTrigger className="p-2">Options</SidebarTrigger>
      <SidebarContent className="p-4">
        <h2 className="text-lg font-bold mb-4">Visualization Options</h2>
        <p className="mb-2 text-sm">Dimensionality Reduction:</p>
        <Select value={selectedMethod} onValueChange={onMethodChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="umap">UMAP</SelectItem>
            <SelectItem value="pca">PCA</SelectItem>
            <SelectItem value="tsne">t‑SNE</SelectItem>
          </SelectContent>
        </Select>
        {/* ここに他のフィルタオプションも追加可能 */}
      </SidebarContent>
    </Sidebar>
  );
};
