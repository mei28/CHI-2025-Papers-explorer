import React from "react";
import { Twitter, Github } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 text-white py-6 mt-12">
      <div className="container mx-auto flex flex-col items-center justify-center">
        {/* 著作権表示とサイト名 */}
        <p className="text-center text-sm mb-1">
          © 2025 CHI 2025 Papers Explorer. All rights reserved.
        </p>
        {/* 制作情報 */}
        <p className="text-center text-xs mb-4">Created by Mingzhe Yang</p>
        {/* ソーシャルアイコン */}
        <div className="flex space-x-6">
          <a
            href="https://twitter.com/_mei28_"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (JP)"
            className="transition-colors hover:text-blue-300"
          >
            <Twitter className="w-6 h-6" style={{ color: "#1DA1F2" }} />
          </a>
          <a
            href="https://github.com/mei28/CHI-2025-Papers-explorer"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="transition-colors hover:text-gray-300"
          >
            <Github className="w-6 h-6" />
          </a>
          <a
            href="https://twitter.com/_me_i28"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (EN)"
            className="transition-colors hover:text-pink-300"
          >
            <Twitter className="w-6 h-6" style={{ color: "#FF69B4" }} />
          </a>
        </div>
      </div>
    </footer>
  );
};

