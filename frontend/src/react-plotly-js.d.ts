declare module "react-plotly.js" {
  import * as React from "react";
  import { PlotlyHTMLElement } from "plotly.js-dist";
  
  export interface PlotProps extends React.HTMLAttributes<PlotlyHTMLElement> {
    data: any;
    layout?: any;
    config?: any;
    style?: React.CSSProperties;
    className?: string;
    onHover?: (event: any) => void;
    onUnhover?: (event: any) => void;
    onClick?: (event: any) => void;
    useResizeHandler?: boolean;
  }
  
  const Plot: React.FC<PlotProps>;
  export default Plot;
}
