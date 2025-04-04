import React from "react";
import { Footer } from "./Footer";

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

