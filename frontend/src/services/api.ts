import axios from "axios";

const isProduction = process.env.NODE_ENV === "production";

const api = axios.create({
  baseURL: isProduction ? "/api/backend" : "http://127.0.0.1:8000/api/backend",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Auth token injection ───────────────────────────────────────────────────
const TOKEN_KEY = "campaigns_hub_token";
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ─────────────────────────────────────────────────────────────────────────────
// Request / Response interfaces
// ─────────────────────────────────────────────────────────────────────────────

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

// ── Milestone 2: Full Pipeline ────────────────────────────────────────────────

export interface FullPipelineRequest {
  topic: string;
  tone?: string;
  target_lang?: string;
  audience_type?: string;
  location?: string;
  role?: string;
  preferences?: string;
}

export interface QualityCheckResult {
  grammar: { pass: boolean; issues: string[] };
  clarity: { pass: boolean; score: number; issues: string[] };
  tone_appropriateness: { pass: boolean; issues: string[] };
  sensitive_content: { pass: boolean; flags: string[] };
  facts_verification: { pass: boolean; unverifiable_claims: string[] };
  policy_compliance: { pass: boolean; violations: string[] };
  overall_score: number;
  recommendation: "approve" | "review" | "reject";
}

export interface ToneAnalysis {
  analysis: string;
  issues: string[];
  improved: string;
  tone_score: number;
}

export interface FullPipelineResponse {
  topic: string;
  tone: string;
  target_language: string;
  audience_type: string;
  original_content: string;
  translated_content: string;
  personalized_content: string;
  final_content: string;
  sentiment: { sentiment: string; confidence: number };
  tone_analysis: ToneAnalysis;
  quality_check: QualityCheckResult;
  pipeline_steps: Array<{ step: string; status: string; error?: string }>;
  campaign_id?: string;
}

export interface TranslateRequest {
  content: string;
  source_lang?: string;
  target_lang: string;
}

export interface TranslateResponse {
  original: string;
  translated: string;
  source_language: string;
  target_language: string;
}

export interface PersonalizeRequest {
  content: string;
  audience_type?: string;
  location?: string;
  role?: string;
  preferences?: string;
}

export interface PersonalizeResponse {
  original: string;
  personalized: string;
  audience_type: string;
  location: string;
  role: string;
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string | null;
  organization?: string | null;
  preferred_language?: string | null;
  role?: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}

export interface AdminUserUpdate {
  role?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string;
  organization?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API functions
// ─────────────────────────────────────────────────────────────────────────────

// ── Legacy simple campaign ────────────────────────────────────────────────────
export const generateCampaign = async (data: {
  topic: string;
  tone: string;
  target_lang: string;
}): Promise<CampaignResponse> => {
  const response = await api.post("/campaign/generate", data);
  return response.data;
};

export const getCampaignHistory = async (): Promise<CampaignResponse[]> => {
  const response = await api.get("/campaigns/history");
  return response.data;
};

// ── Milestone 2 endpoints ─────────────────────────────────────────────────────
export const generateFullPipeline = async (
  data: FullPipelineRequest
): Promise<FullPipelineResponse> => {
  const response = await api.post("/content/generate", data);
  return response.data;
};

export const translateContent = async (
  data: TranslateRequest
): Promise<TranslateResponse> => {
  const response = await api.post("/content/translate", data);
  return response.data;
};

export const personalizeContent = async (
  data: PersonalizeRequest
): Promise<PersonalizeResponse> => {
  const response = await api.post("/content/personalize", data);
  return response.data;
};

export const qualityCheck = async (
  content: string
): Promise<QualityCheckResult> => {
  const response = await api.post("/content/quality-check", { content });
  return response.data;
};

// ── Admin endpoints ───────────────────────────────────────────────────────────
export const adminGetUsers = async (): Promise<AdminUser[]> => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const adminUpdateUser = async (
  userId: string,
  data: AdminUserUpdate
): Promise<AdminUser> => {
  const response = await api.patch(`/admin/users/${userId}`, data);
  return response.data;
};

export const adminDeleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/admin/users/${userId}`);
};

export default api;
