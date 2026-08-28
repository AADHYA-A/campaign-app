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
  department?: string | null;
  manager_id?: string | null;
}


export interface AdminUserUpdate {
  role?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  full_name?: string;
  organization?: string;
  department?: string;
  manager_id?: string | null;
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

// ── Milestone 3: Multi-Channel Distribution & Analytics Interfaces ─────────────

export interface ChannelMetric {
  channel_name: string;
  provider: string;
  color: string;
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  retrying: number;
  pending: number;
  opens: number;
  clicks: number;
  responses: number;
  delivery_rate_pct: number;
  open_rate_pct: number;
  ctr_pct: number;
  response_rate_pct: number;
}

export interface DistributionJob {
  id: string;
  title: string;
  content: string;
  channels: string[];
  language: string;
  schedule_type: "immediate" | "scheduled" | "recurring";
  scheduled_at?: string | null;
  recurring_frequency?: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "paused";
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  failed_count: number;
  retrying_count: number;
  pending_count: number;
  open_count: number;
  click_count: number;
  response_count: number;
  channel_metrics?: Record<string, ChannelMetric>;
  created_at?: string;
}

export interface LaunchDistributionRequest {
  title: string;
  content: string;
  channels: string[];
  language?: string;
  schedule_type?: "immediate" | "scheduled" | "recurring";
  scheduled_at?: string | null;
  recurring_frequency?: string;
  audience_size?: number;
  campaign_id?: string | null;
  recipient_ids?: string[];
}

export interface Recipient {
  id: string;
  name: string;
  phone_number?: string | null;
  email?: string | null;
  language: string;
  tags: string[];
  created_at?: string;
}

export interface RecipientCreateRequest {
  name: string;
  phone_number?: string;
  email?: string;
  language?: string;
  tags?: string[];
}

export interface DeliveryLog {
  id: string;
  recipient_identifier: string;
  recipient_name: string;
  channel: string;
  language: string;
  status: "sent" | "delivered" | "failed" | "pending" | "retrying";
  failure_reason?: string | null;
  retry_count: number;
  latency_ms: number;
  is_opened: boolean;
  is_clicked: boolean;
  has_response: boolean;
  sent_at?: string;
  delivered_at?: string | null;
  opened_at?: string | null;
  clicked_at?: string | null;
}

export interface AudienceFeedbackItem {
  id: string;
  recipient_name: string;
  channel: string;
  language: string;
  feedback_text: string;
  sentiment: "positive" | "neutral" | "negative";
  sentiment_score: number;
  key_theme: string;
  created_at?: string;
}

export interface FeedbackSummaryResponse {
  distribution_id: string;
  total_count: number;
  sentiment_breakdown: {
    positive_pct: number;
    neutral_pct: number;
    negative_pct: number;
  };
  feedbacks: AudienceFeedbackItem[];
}

export interface AnalyticsOverviewResponse {
  summary: {
    total_campaigns: number;
    total_distributions: number;
    total_audience_reach: number;
    total_delivered: number;
    total_failed: number;
    total_retrying: number;
    total_pending: number;
    delivery_rate_pct: number;
    open_rate_pct: number;
    ctr_pct: number;
    response_rate_pct: number;
  };
  sentiment_overview: {
    positive_pct: number;
    neutral_pct: number;
    negative_pct: number;
    average_score: number;
    total_feedback_count: number;
  };
  hourly_trends: Array<{
    time: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }>;
  channels: Array<{
    channel: string;
    icon: string;
    reach: number;
    delivery_rate: number;
    open_rate: number;
    ctr: number;
    response_rate: number;
    status: string;
    color: string;
  }>;
  languages: Array<{
    code: string;
    language: string;
    reach: number;
    delivery_rate: number;
    open_rate: number;
    sentiment_score: number;
  }>;
}

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

// ── Admin Campaign Review ─────────────────────────────────────────────────────
export interface AdminCampaign {
  id: string;
  topic: string;
  tone: string;
  original_content: string;
  translated_content?: string | null;
  target_language?: string | null;
  sentiment_label?: string | null;
  status: "pending" | "approved" | "rejected";
  admin_note?: string | null;
  user_id?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  created_at?: string | null;
}

export const adminGetCampaigns = async (): Promise<AdminCampaign[]> => {
  const response = await api.get("/admin/campaigns");
  return response.data;
};

export const adminUpdateCampaignStatus = async (
  campaignId: string,
  status: "approved" | "rejected" | "pending",
  adminNote?: string
): Promise<AdminCampaign> => {
  const response = await api.patch(`/admin/campaigns/${campaignId}/status`, {
    status,
    admin_note: adminNote ?? null,
  });
  return response.data;
};


export const launchDistribution = async (
  data: LaunchDistributionRequest
): Promise<DistributionJob> => {
  const response = await api.post("/distribution/launch", data);
  return response.data;
};

export const getDistributionList = async (): Promise<DistributionJob[]> => {
  const response = await api.get("/distribution/list");
  return response.data;
};

export const getDistributionJob = async (
  jobId: string
): Promise<DistributionJob> => {
  const response = await api.get(`/distribution/${jobId}`);
  return response.data;
};

export const getDeliveryLogs = async (
  jobId: string,
  params?: { channel?: string; status_filter?: string; search?: string }
): Promise<DeliveryLog[]> => {
  const response = await api.get(`/distribution/${jobId}/logs`, { params });
  return response.data;
};

export const retryFailedMessages = async (
  jobId: string
): Promise<{ distribution_id: string; recovered_count: number; message: string }> => {
  const response = await api.post(`/distribution/${jobId}/retry`);
  return response.data;
};

export const getDistributionFeedback = async (
  jobId: string
): Promise<FeedbackSummaryResponse> => {
  const response = await api.get(`/distribution/${jobId}/feedback`);
  return response.data;
};

export const submitAudienceFeedback = async (
  jobId: string,
  data: { recipient_name: string; channel: string; language: string; feedback_text: string }
): Promise<AudienceFeedbackItem> => {
  const response = await api.post(`/distribution/${jobId}/feedback`, data);
  return response.data;
};

export interface ChannelTestResult {
  channel: string;
  channel_name: string;
  provider: string;
  status: string;
  http_status: number;
  latency_ms: number;
  target: string;
  message_id: string;
  verified_at: string;
  message: string;
}

// ── Recipients / Audience list ────────────────────────────────────────────────
export const addRecipient = async (
  data: RecipientCreateRequest
): Promise<Recipient> => {
  const response = await api.post("/recipients", data);
  return response.data;
};

export const getRecipients = async (): Promise<{ total: number; recipients: Recipient[] }> => {
  const response = await api.get("/recipients");
  return response.data;
};

export const updateRecipient = async (
  recipientId: string,
  data: Partial<RecipientCreateRequest>
): Promise<Recipient> => {
  const response = await api.put(`/recipients/${recipientId}`, data);
  return response.data;
};

export const deleteRecipient = async (recipientId: string): Promise<void> => {
  await api.delete(`/recipients/${recipientId}`);
};

export const testChannel = async (
  channel: string,
  test_recipient?: string
): Promise<ChannelTestResult> => {
  const response = await api.post("/channels/test", {
    channel,
    test_recipient,
  });
  return response.data;
};

export const getAnalyticsOverview = async (): Promise<AnalyticsOverviewResponse> => {
  const response = await api.get("/analytics/overview");
  return response.data;
};

export default api;
