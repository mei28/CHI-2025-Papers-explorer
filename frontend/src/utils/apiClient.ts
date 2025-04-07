import axios from "axios";

// .envファイルに基づいてVITE_API_BASEがセットされる
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 5000, // タイムアウト5秒
});

// 論文検索用API
export const searchPapers = async (query: string, top_n: number = 10) => {
  try {
    const response = await apiClient.get("/search", {
      params: { query, top_n },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw error;
  }
};

// UMAP 座標取得用API
export const getUmapCoordinates = async () => {
  try {
    const response = await apiClient.get("/umap");
    return response.data;
  } catch (error) {
    console.error("Error fetching UMAP coordinates:", error);
    throw error;
  }
};

export const getDimensionCoordinates = async (method: string = "umap") => {
  try {
    const response = await apiClient.get(`/dimensions`, {
      params: { method }
    });
    console.log("Response from /dimensions:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching dimension coordinates:", error);
    throw error;
  }
};

export default apiClient;
