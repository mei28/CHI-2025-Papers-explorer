import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname の代替
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV;
let apiBase = "http://127.0.0.1:8000"; // dev のデフォルト

if (env === "prod") {
  apiBase = "https://chi-2025-papers-explorer.onrender.com";
}

const content = `VITE_API_BASE=${apiBase}\n`;

// プロジェクトルートの .env ファイルに書き込み
const envPath = path.join(__dirname, "../.env");

fs.writeFileSync(envPath, content, "utf-8");
console.log(`.env file generated with VITE_API_BASE=${apiBase}`);

