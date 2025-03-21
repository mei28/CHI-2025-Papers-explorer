// frontend/src/utils/apiClient.ts

import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export const searchPapers = async (query: string, top_n: number = 10) => {
  const response = await axios.get(`${API_BASE}/search`, {
    params: { query, top_n },
  });
  return response.data;
};

export const getUmapCoordinates = async () => {
  const response = await axios.get(`${API_BASE}/umap`);
  return response.data;
};
