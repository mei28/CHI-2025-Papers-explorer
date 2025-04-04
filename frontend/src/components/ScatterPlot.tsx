import React from "react";
import Plot from "react-plotly.js";
import { Paper } from "./PaperCard";

interface ScatterPlotProps {
  x: number[];
  y: number[];
  colors: number[];
  texts: string[];
  customData: Paper[];
  sizes: number[];
  onHover: (paper: Paper | null) => void;
  onClick: (paper: Paper) => void;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  x,
  y,
  colors,
  texts,
  customData,
  sizes,
  onHover,
  onClick,
}) => {
  return (
    <Plot
      data={[
        {
          x,
          y,
          mode: "markers",
          type: "scatter",
          text: texts,
          customdata: customData,
          hovertemplate: "%{text}<extra></extra>",
          marker: {
            size: sizes,
            color: colors,
            colorscale: "Viridis",
            colorbar: { title: "Score" },
            cmin: 0,
          },
        },
      ]}
      layout={{ title: "UMAP Scatter Plot", autosize: true, height: 600 }}
      useResizeHandler
      style={{ width: "100%" }}
      onHover={(event: any) => {
        if (event.points && event.points[0]) {
          onHover(event.points[0].customdata as Paper);
        }
      }}
      onUnhover={() => onHover(null)}
      onClick={(event: any) => {
        if (event.points && event.points[0]) {
          onClick(event.points[0].customdata as Paper);
        }
      }}
    />
  );
};
