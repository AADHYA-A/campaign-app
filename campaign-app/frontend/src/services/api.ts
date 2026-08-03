import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface CampaignRequest {
  topic: string;
  tone?: string;
  target_lang?: string;
}

export interface CampaignResponse {
  id: string;
  topic: string;
  original_content: string;
  translated_content: string;
  sentiment: {
    sentiment: string;
    confidence: number;
  };
  target_language: string;
  created_at: string;
}

export const generateCampaign = async (data: { topic: string, tone: string, target_lang: string }): Promise<CampaignResponse> => {
  const response = await api.post("/campaign/generate", data);
  return response.data;
};

export const getCampaignHistory = async (): Promise<CampaignResponse[]> => {
  const response = await api.get("/campaigns/history");
  return response.data;
};

export default api;
