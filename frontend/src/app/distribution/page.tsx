"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Mail,
  Smartphone,
  MessageCircle,
  Bell,
  Radio,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Users,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  RotateCw,
  ThumbsUp,
  MinusCircle,
  ThumbsDown,
  Globe,
  Zap,
  Activity,
  Check,
  X,
  Sliders,
  Key,
  Play,
  Download,
  Share2,
  Info,
  Server,
  Layers,
  Cpu,
  MousePointer,
  MessageSquare,
  BarChart2,
  CheckCircle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import {
  launchDistribution,
  getDistributionList,
  getDeliveryLogs,
  retryFailedMessages,
  getDistributionFeedback,
  submitAudienceFeedback,
  testChannel,
  addRecipient,
  getRecipients,
  deleteRecipient,
  DistributionJob,
  DeliveryLog,
  AudienceFeedbackItem,
  LaunchDistributionRequest,
  ChannelTestResult,
  Recipient,
} from "@/services/api";

interface ChannelConfigItem {
  id: string;
  name: string;
  desc: string;
  provider: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
  defaultRate: string;
  latencyMs: number;
  apiKeyMasked: string;
  senderId: string;
  webhookUrl: string;
  rateLimit: number;
  enabled: boolean;
}

const INITIAL_CHANNELS: ChannelConfigItem[] = [
  {
    id: "email",
    name: "Email Broadcast",
    desc: "Targeted rich HTML emails with trackable CTA links & DKIM authentication",
    provider: "SendGrid / Resend API",
    icon: Mail,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.3)",
    defaultRate: "97%",
    latencyMs: 120,
    apiKeyMasked: "sg_live_••••••••••••9a8f",
    senderId: "updates@campaigns.gov.in",
    webhookUrl: "https://api.campaigns.gov.in/webhooks/sendgrid",
    rateLimit: 500,
    enabled: true,
  },
  {
    id: "sms",
    name: "SMS Gateway",
    desc: "High-priority instant regional SMS messages via national DLT gateway",
    provider: "Twilio / Fast2SMS",
    icon: Smartphone,
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.3)",
    defaultRate: "98%",
    latencyMs: 95,
    apiKeyMasked: "tw_auth_••••••••••••3c21",
    senderId: "GOV-ALERT",
    webhookUrl: "https://api.campaigns.gov.in/webhooks/twilio",
    rateLimit: 300,
    enabled: true,
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business API",
    desc: "Interactive conversational alerts with quick-reply buttons and rich media",
    provider: "WhatsApp Cloud API",
    icon: MessageCircle,
    color: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.3)",
    defaultRate: "99%",
    latencyMs: 110,
    apiKeyMasked: "waba_tok_••••••••••••7e44",
    senderId: "+91 80000 12345 (Verified)",
    webhookUrl: "https://api.campaigns.gov.in/webhooks/whatsapp",
    rateLimit: 250,
    enabled: true,
  },
  {
    id: "push",
    name: "Push Notification",
    desc: "Real-time web & mobile application push banners with deep link support",
    provider: "Firebase Cloud Messaging (FCM)",
    icon: Bell,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
    defaultRate: "94%",
    latencyMs: 65,
    apiKeyMasked: "fcm_key_••••••••••••55d2",
    senderId: "campaigns-hub-fcm-v1",
    webhookUrl: "https://api.campaigns.gov.in/webhooks/fcm",
    rateLimit: 1000,
    enabled: true,
  },
  {
    id: "web_broadcast",
    name: "Web Broadcast",
    desc: "Live in-app ribbon and WebSocket stream announcements across web portals",
    provider: "WebSocket Real-time Broadcast",
    icon: Radio,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.3)",
    defaultRate: "99%",
    latencyMs: 45,
    apiKeyMasked: "ws_auth_••••••••••••88bb",
    senderId: "wss://stream.campaigns.gov.in/broadcast",
    webhookUrl: "https://api.campaigns.gov.in/webhooks/websocket",
    rateLimit: 2000,
    enabled: true,
  },
];

const LANGUAGES = [
  { value: "hin", label: "Hindi (हिंदी)" },
  { value: "tam", label: "Tamil (தமிழ்)" },
  { value: "tel", label: "Telugu (తెలుగు)" },
  { value: "ben", label: "Bengali (বাংলা)" },
  { value: "mar", label: "Marathi (मराठी)" },
  { value: "guj", label: "Gujarati (ગુજરાતી)" },
  { value: "kan", label: "Kannada (ಕನ್ನಡ)" },
  { value: "mal", label: "Malayalam (മലയാളം)" },
  { value: "pan", label: "Punjabi (ਪੰਜਾਬੀ)" },
  { value: "eng", label: "English" },
];

export default function DistributionPage() {
  // Navigation: Active Module (1, 2, 3, 4, or 'all')
  const [activeModule, setActiveModule] = useState<number | "all">("all");

  // Channels state
  const [channels, setChannels] = useState<ChannelConfigItem[]>(INITIAL_CHANNELS);
  const [selectedChannelForConfig, setSelectedChannelForConfig] = useState<ChannelConfigItem | null>(null);
  const [testResult, setTestResult] = useState<ChannelTestResult | null>(null);
  const [isTestingChannel, setIsTestingChannel] = useState<string | null>(null);

  // Module 2 Form State (Campaign Scheduling)
  const [campaignName, setCampaignName] = useState("Dengue Awareness");
  const [campaignDate, setCampaignDate] = useState("2026-08-20");
  const [campaignTime, setCampaignTime] = useState("10:00");
  const [frequency, setFrequency] = useState("One Time");
  const [scheduledChannels, setScheduledChannels] = useState<string[]>([
    "email",
    "sms",
    "whatsapp",
    "push",
  ]);
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST +5:30)");
  const [priority, setPriority] = useState("High (Health Priority)");
  const [audienceSize, setAudienceSize] = useState(10000);
  const [audienceSegment, setAudienceSegment] = useState("all");

  // Recipients (real audience: name + phone number) state
  const [audienceMode, setAudienceMode] = useState<"simulated" | "recipients">("simulated");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [newRecipientName, setNewRecipientName] = useState("");
  const [newRecipientPhone, setNewRecipientPhone] = useState("");
  const [newRecipientEmail, setNewRecipientEmail] = useState("");
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  const [campaignContent, setCampaignContent] = useState(
    "डेंगू से बचाव के लिए अपने आसपास पानी जमा न होने दें। मच्छरदानी का प्रयोग करें और बुखार होने पर तुरंत नजदीकी स्वास्थ्य केंद्र से संपर्क करें। स्वास्थ्य विभाग द्वारा जनहित में जारी।"
  );
  const [broadcastLanguage, setBroadcastLanguage] = useState("hin");

  // Execution & Live Delivery Tracking State (Module 3)
  const [isLaunching, setIsLaunching] = useState(false);
  const [currentJob, setCurrentJob] = useState<DistributionJob | null>(null);
  const [jobsList, setJobsList] = useState<DistributionJob[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [logFilterChannel, setLogFilterChannel] = useState("all");
  const [logFilterStatus, setLogFilterStatus] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);

  // Module 3 metrics are populated from the selected distribution job.
  const [deliveryMetrics, setDeliveryMetrics] = useState({
    delivered: 0, deliveredPct: 0, failed: 0, failedPct: 0, pending: 0, pendingPct: 0,
    retrying: 0, retryingPct: 0, openRate: 0, openRatePct: 0, ctr: 0, ctrPct: 0,
    responses: 0, responsesPct: 0, participation: 0, participationPct: 0,
  });

  // Module 4 State (Feedback & Sentiment)
  const [feedbackList, setFeedbackList] = useState<AudienceFeedbackItem[]>([]);

  const [sentimentBreakdown, setSentimentBreakdown] = useState({
    positive_pct: 0,
    neutral_pct: 0,
    negative_pct: 0,
  });

  // Custom feedback simulation form
  const [fbName, setFbName] = useState("");
  const [fbText, setFbText] = useState("");
  const [fbChannel, setFbChannel] = useState("whatsapp");
  const [fbLang, setFbLang] = useState("hin");
  const [isSubmittingFb, setIsSubmittingFb] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load jobs and mock delivery logs on mount
  useEffect(() => {
    loadJobs();
    loadRecipients();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadJobs = async () => {
    try {
      const list = await getDistributionList();
      setJobsList(list);
      if (list.length > 0 && !currentJob) {
        selectJob(list[0]);
      } else if (!currentJob) {
        setDeliveryLogs([]);
      }
    } catch (err) {
      setJobsList([]);
      setDeliveryLogs([]);
      showToast("Distribution data could not be loaded. Check the backend connection.");
    }
  };

  // ── Recipients (real audience: name + phone number) ─────────────────────────
  const loadRecipients = async () => {
    setIsLoadingRecipients(true);
    try {
      const res = await getRecipients();
      setRecipients(res.recipients);
      setSelectedRecipientIds(res.recipients.map((r) => r.id));
    } catch (err) {
      console.warn("Could not load saved recipients:", err);
    } finally {
      setIsLoadingRecipients(false);
    }
  };

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecipientError(null);

    if (!newRecipientName.trim()) {
      setRecipientError("Please enter the recipient's name.");
      return;
    }
    if (!newRecipientPhone.trim() && !newRecipientEmail.trim()) {
      setRecipientError("Please enter a phone number or an email address.");
      return;
    }

    setIsAddingRecipient(true);
    try {
      const created = await addRecipient({
        name: newRecipientName.trim(),
        phone_number: newRecipientPhone.trim() || undefined,
        email: newRecipientEmail.trim() || undefined,
        language: broadcastLanguage,
      });
      setRecipients((prev) => [created, ...prev]);
      setSelectedRecipientIds((prev) => [created.id, ...prev]);
      setNewRecipientName("");
      setNewRecipientPhone("");
      setNewRecipientEmail("");
      showToast(`Added ${created.name} to your recipients list.`);
    } catch (err) {
      setRecipientError("Could not save this recipient. Please check the backend connection and try again.");
    } finally {
      setIsAddingRecipient(false);
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
    setSelectedRecipientIds((prev) => prev.filter((rid) => rid !== id));
    try {
      await deleteRecipient(id);
    } catch (err) {
      await loadRecipients();
      showToast("Could not delete recipient. The latest server data has been restored.");
    }
  };

  const toggleSelectRecipient = (id: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  const generateDefaultLogs = () => {
    const sampleRecipients = [
      { name: "Aarav Sharma", id: "aarav.sharma@gov.in", ch: "email", status: "delivered", lat: 118, op: true, cl: true, rp: true, err: null },
      { name: "Priya Patel", id: "+91 98202 34567", ch: "sms", status: "delivered", lat: 88, op: true, cl: true, rp: true, err: null },
      { name: "Rajesh Kumar", id: "+91 98303 45678", ch: "whatsapp", status: "delivered", lat: 104, op: true, cl: true, rp: true, err: null },
      { name: "Ananya Iyer", id: "+91 98404 56789", ch: "whatsapp", status: "delivered", lat: 98, op: true, cl: true, rp: true, err: null },
      { name: "Vikram Singh", id: "device_token_fcm_985", ch: "push", status: "failed", lat: 210, op: false, cl: false, rp: false, err: "Carrier Gateway Timeout (Error 408)" },
      { name: "Sneha Reddy", id: "+91 98606 78901", ch: "sms", status: "delivered", lat: 92, op: true, cl: false, rp: false, err: null },
      { name: "Rohan Mehta", id: "rohan.mehta@enterprise.in", ch: "email", status: "delivered", lat: 135, op: true, cl: true, rp: true, err: null },
      { name: "Kavita Joshi", id: "device_token_fcm_441", ch: "push", status: "retrying", lat: 180, op: false, cl: false, rp: false, err: "Throttling limit - Auto re-queueing" },
      { name: "Aditya Verma", id: "+91 98909 01234", ch: "whatsapp", status: "delivered", lat: 112, op: true, cl: true, rp: false, err: null },
      { name: "Deepika Nair", id: "deepika.nair@health.org", ch: "email", status: "delivered", lat: 125, op: true, cl: false, rp: false, err: null },
      { name: "Manoj Gupta", id: "+91 98111 22334", ch: "sms", status: "delivered", lat: 94, op: true, cl: true, rp: false, err: null },
      { name: "Pooja Deshmukh", id: "ws_client_session_88", ch: "web_broadcast", status: "delivered", lat: 42, op: true, cl: true, rp: false, err: null },
      { name: "Suresh Pillai", id: "+91 98333 44556", ch: "whatsapp", status: "delivered", lat: 106, op: true, cl: true, rp: false, err: null },
      { name: "Meera Nambiar", id: "+91 98444 55667", ch: "sms", status: "pending", lat: 0, op: false, cl: false, rp: false, err: "Queued for batch dispatch" },
      { name: "Karan Malhotra", id: "device_token_fcm_712", ch: "push", status: "failed", lat: 195, op: false, cl: false, rp: false, err: "FCM Push Token Expired" },
    ];

    const logs: DeliveryLog[] = sampleRecipients.map((r, i) => ({
      id: `log-${i + 1}`,
      recipient_identifier: r.id,
      recipient_name: r.name,
      channel: r.ch,
      language: "hin",
      status: r.status as any,
      failure_reason: r.err,
      retry_count: r.status === "failed" ? 2 : r.status === "retrying" ? 1 : 0,
      latency_ms: r.lat,
      is_opened: r.op,
      is_clicked: r.cl,
      has_response: r.rp,
      sent_at: "2026-08-20T10:00:00",
      delivered_at: r.status === "delivered" ? "2026-08-20T10:00:02" : null,
      opened_at: r.op ? "2026-08-20T10:05:00" : null,
      clicked_at: r.cl ? "2026-08-20T10:07:30" : null,
    }));

    setDeliveryLogs(logs);
  };

  const selectJob = async (job: DistributionJob) => {
    setCurrentJob(job);
    setCampaignName(job.title);
    setCampaignContent(job.content);
    setScheduledChannels(job.channels);
    setAudienceSize(job.total_recipients);
    try {
      const logs = await getDeliveryLogs(job.id);
      if (logs && logs.length > 0) {
        setDeliveryLogs(logs);
      }
      const fbData = await getDistributionFeedback(job.id);
      if (fbData && fbData.feedbacks && fbData.feedbacks.length > 0) {
        setFeedbackList(fbData.feedbacks);
      }
      if (fbData && fbData.sentiment_breakdown) {
        setSentimentBreakdown(fbData.sentiment_breakdown);
      }
      // Update metrics based on job
      if (job.sent_count > 0) {
        setDeliveryMetrics({
          delivered: job.delivered_count,
          deliveredPct: Math.round((job.delivered_count / job.total_recipients) * 1000) / 10,
          failed: job.failed_count,
          failedPct: Math.round((job.failed_count / job.total_recipients) * 1000) / 10,
          pending: job.pending_count,
          pendingPct: Math.round((job.pending_count / job.total_recipients) * 1000) / 10,
          retrying: job.retrying_count,
          retryingPct: Math.round((job.retrying_count / job.total_recipients) * 1000) / 10,
          openRate: job.open_count,
          openRatePct: Math.round((job.open_count / Math.max(1, job.delivered_count)) * 1000) / 10,
          ctr: job.click_count,
          ctrPct: Math.round((job.click_count / Math.max(1, job.open_count)) * 1000) / 10,
          responses: job.response_count,
          responsesPct: Math.round((job.response_count / Math.max(1, job.delivered_count)) * 1000) / 10,
          participation: Math.round(job.response_count * 0.64),
          participationPct: Math.round((Math.round(job.response_count * 0.64) / Math.max(1, job.total_recipients)) * 1000) / 10,
        });
      }
    } catch (err) {
      console.warn("Using active state values", err);
    }
  };

  // Channel Toggle
  const toggleChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) => (ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch))
    );
    if (scheduledChannels.includes(channelId)) {
      if (scheduledChannels.length > 1) {
        setScheduledChannels(scheduledChannels.filter((c) => c !== channelId));
      }
    } else {
      setScheduledChannels([...scheduledChannels, channelId]);
    }
  };

  // Test Channel Handshake
  const handleTestChannel = async (channelId: string) => {
    setIsTestingChannel(channelId);
    setTestResult(null);
    try {
      const res = await testChannel(channelId);
      setTestResult(res);
      showToast(`Channel "${res.channel_name}" connected successfully! Ping latency: ${res.latency_ms}ms.`);
    } catch (err) {
      showToast("Channel test failed. Verify that the server and channel configuration are available.");
    } finally {
      setIsTestingChannel(null);
    }
  };

  // Save API Key Configuration Modal
  const handleSaveChannelConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChannelForConfig) return;
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === selectedChannelForConfig.id ? selectedChannelForConfig : ch
      )
    );
    showToast(`Configuration updated for ${selectedChannelForConfig.name}.`);
    setSelectedChannelForConfig(null);
  };

  // Module 2: Launch / Schedule Campaign
  const handleScheduleCampaign = async () => {
    if (!campaignName.trim() || !campaignContent.trim()) {
      alert("Please provide Campaign Name and Broadcast Content.");
      return;
    }
    if (scheduledChannels.length === 0) {
      alert("Please select at least one channel.");
      return;
    }
    if (audienceMode === "recipients" && selectedRecipientIds.length === 0) {
      alert("Please add or select at least one recipient (name + phone number), or switch to Simulated Audience.");
      return;
    }

    const effectiveAudienceSize =
      audienceMode === "recipients" ? selectedRecipientIds.length : audienceSize;

    setIsLaunching(true);
    try {
      const req: LaunchDistributionRequest = {
        title: campaignName,
        content: campaignContent,
        channels: scheduledChannels,
        language: broadcastLanguage,
        schedule_type: frequency === "One Time" ? "scheduled" : "recurring",
        scheduled_at: `${campaignDate}T${campaignTime}`,
        recurring_frequency: frequency.toLowerCase(),
        audience_size: effectiveAudienceSize,
        recipient_ids: audienceMode === "recipients" ? selectedRecipientIds : [],
      };

      const job = await launchDistribution(req);
      setCurrentJob(job);
      await loadJobs();
      await selectJob(job);
      showToast(`Campaign "${campaignName}" successfully scheduled and dispatched!`);
      setActiveModule(3); // Navigate to Module 3: Delivery Tracking
    } catch (err) {
      showToast("Campaign was not scheduled. Check the backend connection and try again.");
    } finally {
      setIsLaunching(false);
    }
  };

  // Module 3: Retry Failed Messages
  const handleRetryFailed = async () => {
    setIsRetrying(true);
    setRetryMessage(null);
    try {
      if (currentJob) {
        const res = await retryFailedMessages(currentJob.id);
        setRetryMessage(res.message);
        await selectJob(currentJob);
        await loadJobs();
      } else {
        throw new Error("Select a server-backed distribution before retrying messages.");
      }
    } catch (err) {
      setRetryMessage(err instanceof Error ? err.message : "Could not retry the failed messages.");
    }
    setIsRetrying(false);
  };

  // Module 4: Submit Live Audience Feedback
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbText.trim()) return;
    setIsSubmittingFb(true);

    if (!currentJob) {
      showToast("Select a distribution before recording feedback.");
      setIsSubmittingFb(false);
      return;
    }

    try {
      const feedback = await submitAudienceFeedback(currentJob.id, {
        recipient_name: fbName.trim() || "Audience Respondent",
        channel: fbChannel,
        language: fbLang,
        feedback_text: fbText.trim(),
      });
      setFeedbackList((previous) => [feedback, ...previous]);
      const summary = await getDistributionFeedback(currentJob.id);
      setSentimentBreakdown(summary.sentiment_breakdown);
      setFbText("");
      setFbName("");
      showToast(`Feedback recorded as ${feedback.sentiment.toUpperCase()}.`);
    } catch (err) {
      showToast("Feedback could not be recorded. Please try again.");
    } finally {
      setIsSubmittingFb(false);
    }
  };

  // Preset Dengue Awareness Campaign Scenario (Matches requirements from Slides 1 & 2)
  const applyDenguePreset = () => {
    setCampaignName("Dengue Awareness");
    setCampaignDate("2026-08-20");
    setCampaignTime("10:00");
    setFrequency("One Time");
    setScheduledChannels(["email", "sms", "whatsapp", "push"]);
    setBroadcastLanguage("hin");
    setAudienceSize(10000);
    setCampaignContent(
      "डेंगू जागरूकता अभियान 2026: घर और आसपास पानी जमा न होने दें। मच्छरदानी का प्रयोग करें, पूरी आस्तीन के कपड़े पहनें और तेज बुखार या सिरदर्द होने पर तुरंत नजदीकी सरकारी स्वास्थ्य केंद्र पर संपर्क करें। स्वास्थ्य एवं परिवार कल्याण मंत्रालय द्वारा जनहित में जारी।"
    );
    showToast("Loaded 'Dengue Awareness' preset (Email, SMS, WhatsApp & Push, 10k recipients)!");
  };

  // Filtered delivery logs
  const filteredLogs = useMemo(() => {
    return deliveryLogs.filter((log) => {
      const matchChannel = logFilterChannel === "all" || log.channel === logFilterChannel;
      const matchStatus = logFilterStatus === "all" || log.status === logFilterStatus;
      const matchSearch =
        !logSearch ||
        log.recipient_name.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.recipient_identifier.toLowerCase().includes(logSearch.toLowerCase()) ||
        (log.failure_reason && log.failure_reason.toLowerCase().includes(logSearch.toLowerCase()));
      return matchChannel && matchStatus && matchSearch;
    });
  }, [deliveryLogs, logFilterChannel, logFilterStatus, logSearch]);

  // Export audit logs CSV
  const exportLogsCSV = () => {
    const headers = ["Recipient Name", "Identifier", "Channel", "Status", "Latency (ms)", "Opened", "Clicked", "Replied", "Diagnostic"];
    const rows = filteredLogs.map((l) => [
      `"${l.recipient_name}"`,
      `"${l.recipient_identifier}"`,
      `"${l.channel}"`,
      `"${l.status}"`,
      l.latency_ms,
      l.is_opened ? "Yes" : "No",
      l.is_clicked ? "Yes" : "No",
      l.has_response ? "Yes" : "No",
      `"${l.failure_reason || "Delivered Successfully"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `delivery_logs_${campaignName.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Audit logs exported to CSV.");
  };

  return (
    <div
      className="gradient-bg-main"
      style={{
        minHeight: "calc(100vh - var(--nav-height))",
        padding: "2rem 1.5rem 5rem",
      }}
    >
      <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div
            style={{
              position: "fixed",
              bottom: "2rem",
              right: "2rem",
              zIndex: 9999,
              background: "#1e293b",
              color: "#fff",
              padding: "0.85rem 1.25rem",
              borderRadius: 12,
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.1)",
              animation: "fadeIn 0.2s ease",
            }}
          >
            <Sparkles size={16} color="#10b981" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Top Title & Overview */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.25rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
              <span className="badge badge-purple" style={{ fontSize: "0.78rem", fontWeight: 800, padding: "0.25rem 0.75rem" }}>
                DISTRIBUTION ENGINE
              </span>
              <span className="badge badge-blue" style={{ fontSize: "0.78rem" }}>
                Multi-Channel Distribution & Analytics
              </span>
            </div>
            <h1 className="page-title gradient-text" style={{ fontSize: "2.1rem", marginBottom: "0.35rem", fontWeight: 900 }}>
              Multi-Channel Distribution & Sentiment Intelligence
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.95rem", maxWidth: 900, lineHeight: 1.5 }}>
              Integrate Email, SMS, WhatsApp, Push Notifications & Web Broadcast. Schedule automated delivery,
              track real-time statuses with one-click retries, and monitor audience sentiment through AI NLP insights.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/guide"
              className="btn btn-secondary micro-hover"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(99,102,241,0.06)",
                borderColor: "rgba(99,102,241,0.25)",
                color: "#6366f1",
                fontWeight: 600,
              }}
            >
              <BookOpen size={15} color="#6366f1" /> How to Use
            </Link>
            <button
              onClick={applyDenguePreset}
              className="btn btn-secondary micro-hover"
              style={{
                borderColor: "rgba(16,185,129,0.4)",
                background: "rgba(16,185,129,0.06)",
                color: "#059669",
                fontWeight: 700,
              }}
            >
              <Sparkles size={15} color="#10b981" /> Load Spec Scenario: Dengue Awareness
            </button>
            <Link href="/analytics" className="btn btn-secondary micro-hover">
              <BarChart3 size={15} /> Analytics Dashboard
            </Link>
            <button onClick={loadJobs} className="btn btn-ghost" title="Refresh distribution state">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        {/* Module Selector Tabs */}
        <div
          className="glass-card"
          style={{
            padding: "0.6rem 0.75rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "0.5rem",
            borderRadius: 16,
            background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)",
            border: "1px solid rgba(99,102,241,0.15)",
          }}
        >
          {[
            {
              id: "all",
              num: "ALL",
              name: "Full Pipeline View",
              desc: "End-to-end multi-module pipeline",
              icon: Layers,
              color: "#6366f1",
            },
            {
              id: 1,
              num: "1",
              name: "Module 1: Multi-Channel",
              desc: "Integrate & test 5 channels",
              icon: Radio,
              color: "#3b82f6",
            },
            {
              id: 2,
              num: "2",
              name: "Module 2: Scheduling",
              desc: "Automated delivery & queue",
              icon: Calendar,
              color: "#10b981",
            },
            {
              id: 3,
              num: "3",
              name: "Module 3: Delivery Tracking",
              desc: "Live status & retry engine",
              icon: Activity,
              color: "#f59e0b",
            },
            {
              id: 4,
              num: "4",
              name: "Module 4: Feedback & Sentiment",
              desc: "NLP sentiment classification",
              icon: ThumbsUp,
              color: "#8b5cf6",
            },
          ].map((tab) => {
            const isSelected = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModule(tab.id as any)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: 12,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isSelected ? `2px solid ${tab.color}` : "1px solid transparent",
                  background: isSelected ? `${tab.color}15` : "transparent",
                  color: isSelected ? tab.color : "#475569",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: isSelected ? tab.color : "#f1f5f9",
                    color: isSelected ? "#fff" : tab.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  <tab.icon size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.85rem", color: isSelected ? "#1e293b" : "#475569" }}>
                    {tab.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{tab.desc}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* MODULE 1: MULTI-CHANNEL INTEGRATION                                      */}
        {/* ========================================================================= */}
        {(activeModule === "all" || activeModule === 1) && (
          <section
            id="module-1"
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: 18,
            }}
          >
            {/* Module 1 Header Badge & Title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <span
                    style={{
                      background: "#1e293b",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "0.9rem",
                    }}
                  >
                    1
                  </span>
                  <span style={{ background: "#3b82f6", color: "#fff", padding: "0.2rem 0.65rem", borderRadius: 999, fontSize: "0.75rem", fontWeight: 800 }}>
                    MODULE 1
                  </span>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1e293b", margin: 0 }}>
                  Multi-Channel Integration
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  Integrate multiple communication channels to reach audiences through their preferred medium.
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span className="badge badge-blue">
                  {channels.filter((c) => c.enabled).length} / {channels.length} Channels Connected
                </span>
              </div>
            </div>

            {/* "How it Works" Visual Pipeline Flow (As in Slide 1) */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.03) 0%, rgba(99,102,241,0.05) 100%)",
                border: "1px solid rgba(59,130,246,0.15)",
                borderRadius: 14,
                padding: "1.25rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                HOW IT WORKS:
              </span>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "1rem",
                  marginTop: "0.75rem",
                  alignItems: "center",
                }}
              >
                {[
                  { step: "1. Campaign Content", desc: "AI-translated & verified text", icon: FileTextIcon },
                  { step: "2. Select Channels", desc: "Email, SMS, WhatsApp, Push, Web", icon: Radio },
                  { step: "3. Send via APIs", desc: "Direct carrier & gateway dispatch", icon: Server },
                  { step: "4. Reach Audience", desc: "Delivered on user devices", icon: Users },
                ].map((st, idx) => (
                  <div
                    key={st.step}
                    style={{
                      background: "#fff",
                      padding: "0.85rem 1rem",
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "rgba(59,130,246,0.1)",
                        color: "#3b82f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "0.82rem", color: "#1e293b" }}>{st.step}</div>
                      <div style={{ fontSize: "0.7rem", color: "#64748b" }}>{st.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Channels Grid — Interactive Controls, Testing & Configs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
              {channels.map((ch) => {
                const isSelectedInSchedule = scheduledChannels.includes(ch.id);
                return (
                  <div
                    key={ch.id}
                    className="card micro-hover"
                    style={{
                      padding: "1.25rem",
                      borderRadius: 16,
                      border: ch.enabled ? `1.5px solid ${ch.border}` : "1px solid #e2e8f0",
                      background: ch.enabled ? ch.bg : "#f8fafc",
                      opacity: ch.enabled ? 1 : 0.65,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.85rem",
                      position: "relative",
                    }}
                  >
                    {/* Header: Icon, Name & Toggle Switch */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: ch.color,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: `0 4px 12px ${ch.color}35`,
                          }}
                        >
                          <ch.icon size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 800, fontSize: "0.95rem", margin: 0, color: "#1e293b" }}>
                            {ch.name}
                          </h4>
                          <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{ch.provider}</span>
                        </div>
                      </div>

                      {/* Enable / Disable Channel Toggle */}
                      <button
                        onClick={() => toggleChannel(ch.id)}
                        style={{
                          background: ch.enabled ? ch.color : "#cbd5e1",
                          border: "none",
                          borderRadius: 999,
                          width: 42,
                          height: 22,
                          display: "flex",
                          alignItems: "center",
                          padding: "2px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        title={ch.enabled ? "Channel Enabled (Click to disable)" : "Channel Disabled (Click to enable)"}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "#fff",
                            transform: ch.enabled ? "translateX(20px)" : "translateX(0px)",
                            transition: "all 0.2s ease",
                          }}
                        />
                      </button>
                    </div>

                    <p style={{ fontSize: "0.78rem", color: "#64748b", lineHeight: 1.4, margin: 0 }}>
                      {ch.desc}
                    </p>

                    {/* Channel Metadata Badges */}
                    <div
                      style={{
                        padding: "0.6rem 0.75rem",
                        borderRadius: 10,
                        background: "#fff",
                        border: "1px solid rgba(0,0,0,0.06)",
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.72rem",
                        color: "#64748b",
                      }}
                    >
                      <span>
                        Status: <strong style={{ color: ch.enabled ? "#10b981" : "#94a3b8" }}>{ch.enabled ? "Active" : "Disabled"}</strong>
                      </span>
                      <span>
                        Benchmark: <strong style={{ color: ch.color }}>{ch.defaultRate}</strong>
                      </span>
                      <span>
                        Latency: <strong>~{ch.latencyMs}ms</strong>
                      </span>
                    </div>

                    {/* Actions: Test Channel & Manage API Keys */}
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto", paddingTop: "0.4rem" }}>
                      <button
                        onClick={() => handleTestChannel(ch.id)}
                        disabled={!ch.enabled || isTestingChannel === ch.id}
                        className="btn btn-secondary btn-sm"
                        style={{
                          flex: 1,
                          fontSize: "0.75rem",
                          color: ch.color,
                          borderColor: `${ch.color}40`,
                        }}
                      >
                        {isTestingChannel === ch.id ? (
                          <>
                            <RotateCw size={12} className="animate-spin-slow" /> Pinging...
                          </>
                        ) : (
                          <>
                            <Play size={12} /> Test Channel
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setSelectedChannelForConfig(ch)}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: "0.75rem", padding: "0.35rem 0.6rem" }}
                        title="Configure API credentials & sender ID"
                      >
                        <Key size={13} /> Config
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Test Result Toast Banner if a test was performed */}
            {testResult && (
              <div
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: 12,
                  padding: "0.85rem 1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <CheckCircle size={18} color="#10b981" />
                  <span style={{ fontSize: "0.85rem", color: "#059669", fontWeight: 700 }}>
                    {testResult.message}
                  </span>
                  <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>
                    HTTP {testResult.http_status} OK
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Target: <code>{testResult.target}</code> | Msg ID: <code>{testResult.message_id}</code>
                </div>
              </div>
            )}

            {/* Key Features & Example Box (Matches Slide 1 Layout) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div
                style={{
                  background: "rgba(59,130,246,0.04)",
                  border: "1px solid rgba(59,130,246,0.15)",
                  borderRadius: 14,
                  padding: "1.1rem 1.25rem",
                }}
              >
                <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#3b82f6", marginBottom: "0.6rem", textTransform: "uppercase" }}>
                  Key Features (Module 1):
                </h4>
                <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.82rem", color: "#475569", lineHeight: 1.7 }}>
                  <li>Connect to Email, SMS, WhatsApp Business API, Push Notification and Web Broadcast.</li>
                  <li>Manage channel configurations and API keys.</li>
                  <li>Test each channel before sending campaigns.</li>
                  <li>Enable/disable channels as per requirement.</li>
                </ul>
              </div>

              <div
                style={{
                  background: "rgba(16,185,129,0.04)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: 14,
                  padding: "1.1rem 1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                    <span className="badge badge-green" style={{ fontSize: "0.7rem", fontWeight: 800 }}>EXAMPLE SPEC</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "#334155", lineHeight: 1.5, margin: 0 }}>
                    <strong>A Dengue Awareness campaign</strong> is sent via Email, SMS, WhatsApp and Push Notification to ensure maximum reach.
                  </p>
                </div>
                <button
                  onClick={applyDenguePreset}
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: "flex-start", marginTop: "0.75rem", fontSize: "0.78rem" }}
                >
                  <Sparkles size={12} /> Load Dengue Campaign Setup
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* MODULE 2: CAMPAIGN SCHEDULING & AUTOMATED DELIVERY                        */}
        {/* ========================================================================= */}
        {(activeModule === "all" || activeModule === 2) && (
          <section
            id="module-2"
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: 18,
            }}
          >
            {/* Module 2 Header Badge & Title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <span
                    style={{
                      background: "#1e293b",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "0.9rem",
                    }}
                  >
                    2
                  </span>
                  <span style={{ background: "#10b981", color: "#fff", padding: "0.2rem 0.65rem", borderRadius: 999, fontSize: "0.75rem", fontWeight: 800 }}>
                    MODULE 2
                  </span>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1e293b", margin: 0 }}>
                  Campaign Scheduling & Automated Delivery
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  Schedule campaigns and automatically deliver messages at the right time to the right audience.
                </p>
              </div>
            </div>

            {/* Scheduling Flow Visual Diagram (As in Slide 2) */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(59,130,246,0.04) 100%)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 14,
                padding: "1.25rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                SCHEDULING FLOW:
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  marginTop: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "Create Campaign", icon: Calendar, active: true },
                  { label: "Choose Date & Time", icon: Clock, active: true },
                  { label: "Select Audience", icon: Users, active: true },
                  { label: "Schedule & Send", icon: Send, active: true },
                ].map((fl, idx, arr) => (
                  <div key={fl.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 160 }}>
                    <div
                      style={{
                        background: "#fff",
                        padding: "0.85rem 1rem",
                        borderRadius: 12,
                        border: "1px solid rgba(16,185,129,0.3)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        width: "100%",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "rgba(16,185,129,0.12)",
                          color: "#059669",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <fl.icon size={16} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: "0.82rem", color: "#1e293b" }}>{fl.label}</span>
                    </div>
                    {idx < arr.length - 1 && <span style={{ color: "#94a3b8", fontWeight: 700 }}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduling Form & UI (Exact layout matching Slide 2 "Example UI") */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem" }}>
              {/* Example UI Mockup Card from Slide 2 */}
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  border: "1.5px solid rgba(16,185,129,0.3)",
                  padding: "1.5rem",
                  boxShadow: "0 10px 30px -10px rgba(16,185,129,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    Schedule Campaign
                  </h3>
                  <span className="badge badge-green" style={{ fontSize: "0.7rem", fontWeight: 800 }}>
                    Example UI Module
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Campaign Name */}
                  <div>
                    <label className="label" style={{ fontSize: "0.82rem", fontWeight: 700 }}>Campaign Name</label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. Dengue Awareness"
                      className="input"
                    />
                  </div>

                  {/* Date & Time Pickers */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label className="label" style={{ fontSize: "0.82rem", fontWeight: 700 }}>Date</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="date"
                          value={campaignDate}
                          onChange={(e) => setCampaignDate(e.target.value)}
                          className="input"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label" style={{ fontSize: "0.82rem", fontWeight: 700 }}>Time</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type="time"
                          value={campaignTime}
                          onChange={(e) => setCampaignTime(e.target.value)}
                          className="input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="label" style={{ fontSize: "0.82rem", fontWeight: 700 }}>Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="input select"
                    >
                      <option value="One Time">One Time</option>
                      <option value="Daily">Daily Broadcast (Every 24h)</option>
                      <option value="Weekly">Weekly (Every Monday 10:00 AM)</option>
                      <option value="Monthly">Monthly (1st of every month)</option>
                    </select>
                  </div>

                  {/* Channels Checkbox Group */}
                  <div>
                    <label className="label" style={{ fontSize: "0.82rem", fontWeight: 700 }}>Channels</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                      {channels.map((ch) => {
                        const isChecked = scheduledChannels.includes(ch.id);
                        return (
                          <label
                            key={ch.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.45rem",
                              background: isChecked ? `${ch.color}15` : "#f8fafc",
                              border: isChecked ? `1.5px solid ${ch.color}` : "1px solid #cbd5e1",
                              padding: "0.45rem 0.85rem",
                              borderRadius: 8,
                              cursor: "pointer",
                              fontSize: "0.82rem",
                              fontWeight: isChecked ? 700 : 500,
                              color: isChecked ? ch.color : "#64748b",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleChannel(ch.id)}
                              style={{ accentColor: ch.color }}
                            />
                            <ch.icon size={14} />
                            {ch.name.split(" ")[0]}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Primary Schedule Button */}
                  <button
                    onClick={handleScheduleCampaign}
                    disabled={isLaunching}
                    className="btn btn-primary micro-hover"
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      borderColor: "#059669",
                      padding: "0.8rem 1.5rem",
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      marginTop: "0.5rem",
                    }}
                  >
                    {isLaunching ? (
                      <>
                        <RotateCw size={16} className="animate-spin-slow" /> Scheduling & Queueing Campaign...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Schedule Campaign
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Advanced Parameters & Queue Manager */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Audience Sizing & Segment */}
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1e293b" }}>Target Audience Reach</span>
                    <span style={{ color: "#059669", fontWeight: 800, fontSize: "0.95rem" }}>
                      {audienceMode === "simulated"
                        ? `${audienceSize.toLocaleString()} Recipients`
                        : `${selectedRecipientIds.length.toLocaleString()} Recipients`}
                    </span>
                  </div>

                  {/* Mode toggle: Simulated audience size vs. real Name + Phone recipients */}
                  <div style={{ display: "flex", gap: "0.4rem", background: "#eef2f7", borderRadius: 10, padding: 4 }}>
                    <button
                      type="button"
                      onClick={() => setAudienceMode("simulated")}
                      style={{
                        flex: 1,
                        padding: "0.4rem 0.6rem",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: audienceMode === "simulated" ? "#fff" : "transparent",
                        color: audienceMode === "simulated" ? "#059669" : "#64748b",
                        boxShadow: audienceMode === "simulated" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      }}
                    >
                      Simulated Audience Size
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudienceMode("recipients")}
                      style={{
                        flex: 1,
                        padding: "0.4rem 0.6rem",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        background: audienceMode === "recipients" ? "#fff" : "transparent",
                        color: audienceMode === "recipients" ? "#059669" : "#64748b",
                        boxShadow: audienceMode === "recipients" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      }}
                    >
                      My Recipients (Name + Phone)
                    </button>
                  </div>

                  {audienceMode === "simulated" ? (
                    <>
                      <input
                        type="range"
                        min={100}
                        max={10000}
                        step={100}
                        value={audienceSize}
                        onChange={(e) => setAudienceSize(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#10b981" }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8" }}>
                        <span>100 (Pilot)</span>
                        <span>5,000 (District)</span>
                        <span>10,000 (National)</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {/* Add recipient form */}
                      <form
                        onSubmit={handleAddRecipient}
                        style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
                      >
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <input
                            type="text"
                            placeholder="Recipient name"
                            value={newRecipientName}
                            onChange={(e) => setNewRecipientName(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "0.5rem 0.6rem",
                              borderRadius: 8,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.78rem",
                            }}
                          />
                          <input
                            type="tel"
                            placeholder="Phone number"
                            value={newRecipientPhone}
                            onChange={(e) => setNewRecipientPhone(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "0.5rem 0.6rem",
                              borderRadius: 8,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.78rem",
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <input
                            type="email"
                            placeholder="Email (optional)"
                            value={newRecipientEmail}
                            onChange={(e) => setNewRecipientEmail(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "0.5rem 0.6rem",
                              borderRadius: 8,
                              border: "1px solid #cbd5e1",
                              fontSize: "0.78rem",
                            }}
                          />
                          <button
                            type="submit"
                            disabled={isAddingRecipient}
                            className="micro-hover"
                            style={{
                              padding: "0.5rem 0.9rem",
                              borderRadius: 8,
                              border: "none",
                              background: "#10b981",
                              color: "#fff",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isAddingRecipient ? "Adding..." : "+ Add"}
                          </button>
                        </div>
                        {recipientError && (
                          <span style={{ color: "#dc2626", fontSize: "0.72rem" }}>{recipientError}</span>
                        )}
                      </form>

                      {/* Recipients list */}
                      <div
                        style={{
                          maxHeight: 220,
                          overflowY: "auto",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.3rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          background: "#fff",
                          padding: recipients.length ? "0.4rem" : "0.75rem",
                        }}
                      >
                        {isLoadingRecipients ? (
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Loading recipients...</span>
                        ) : recipients.length === 0 ? (
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                            No recipients yet. Add a name and phone number above.
                          </span>
                        ) : (
                          recipients.map((r) => (
                            <div
                              key={r.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "0.5rem",
                                padding: "0.4rem 0.5rem",
                                borderRadius: 8,
                                background: selectedRecipientIds.includes(r.id) ? "#ecfdf5" : "#f8fafc",
                              }}
                            >
                              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", flex: 1, minWidth: 0 }}>
                                <input
                                  type="checkbox"
                                  checked={selectedRecipientIds.includes(r.id)}
                                  onChange={() => toggleSelectRecipient(r.id)}
                                  style={{ accentColor: "#10b981" }}
                                />
                                <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b" }}>{r.name}</span>
                                  <span style={{ fontSize: "0.7rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {r.phone_number || r.email || "—"}
                                  </span>
                                </span>
                              </label>
                              <button
                                type="button"
                                onClick={() => handleDeleteRecipient(r.id)}
                                title="Remove recipient"
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  color: "#94a3b8",
                                  cursor: "pointer",
                                  padding: 4,
                                }}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Queue Management Card */}
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>
                    Queue Management:
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.78rem" }}>
                    <div style={{ background: "#fff", padding: "0.5rem", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <span style={{ color: "#94a3b8" }}>Throughput:</span>
                      <div style={{ fontWeight: 700, color: "#1e293b" }}>500 msg / sec</div>
                    </div>
                    <div style={{ background: "#fff", padding: "0.5rem", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <span style={{ color: "#94a3b8" }}>Concurrency:</span>
                      <div style={{ fontWeight: 700, color: "#10b981" }}>8 Worker Threads</div>
                    </div>
                    <div style={{ background: "#fff", padding: "0.5rem", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <span style={{ color: "#94a3b8" }}>Timezone:</span>
                      <div style={{ fontWeight: 700, color: "#1e293b" }}>IST (UTC+5:30)</div>
                    </div>
                    <div style={{ background: "#fff", padding: "0.5rem", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <span style={{ color: "#94a3b8" }}>Est. Execution:</span>
                      <div style={{ fontWeight: 700, color: "#3b82f6" }}>~20 seconds</div>
                    </div>
                  </div>
                </div>

                {/* Broadcast Content Preview */}
                <div
                  style={{
                    background: "rgba(99,102,241,0.04)",
                    borderRadius: 14,
                    border: "1px dashed rgba(99,102,241,0.3)",
                    padding: "1rem",
                  }}
                >
                  <label className="label" style={{ fontSize: "0.78rem", color: "#4f46e5" }}>
                    Multilingual Content Payload:
                  </label>
                  <textarea
                    rows={2}
                    value={campaignContent}
                    onChange={(e) => setCampaignContent(e.target.value)}
                    className="input"
                    style={{ fontSize: "0.8rem", resize: "vertical" }}
                  />
                </div>
              </div>
            </div>

            {/* Features & Outcome Banner (Matches Slide 2) */}
            <div
              style={{
                background: "rgba(16,185,129,0.04)",
                border: "1px solid rgba(16,185,129,0.2)",
                borderRadius: 14,
                padding: "1.1rem 1.25rem",
              }}
            >
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#059669", marginBottom: "0.6rem", textTransform: "uppercase" }}>
                Key Features (Module 2):
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.5rem", fontSize: "0.82rem", color: "#475569" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#10b981" /> Schedule one-time or recurring campaigns.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#10b981" /> Set timezone, frequency and priority.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#10b981" /> Automated message delivery at scheduled time.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#10b981" /> Support for bulk messaging.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#10b981" /> Queue management for high volume campaigns.
                </div>
              </div>
            </div>

            {/* Outcome Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.08) 100%)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: 12,
                padding: "0.85rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <span className="badge badge-green" style={{ fontSize: "0.75rem", fontWeight: 800 }}>
                OUTCOME
              </span>
              <span style={{ fontSize: "0.9rem", color: "#065f46", fontWeight: 700 }}>
                Messages are automatically delivered to thousands of recipients without manual effort.
              </span>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* MODULE 3: DELIVERY TRACKING & ENGAGEMENT MONITORING                       */}
        {/* ========================================================================= */}
        {(activeModule === "all" || activeModule === 3) && (
          <section
            id="module-3"
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: 18,
            }}
          >
            {/* Module 3 Header Badge & Title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <span
                    style={{
                      background: "#1e293b",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "0.9rem",
                    }}
                  >
                    3
                  </span>
                  <span style={{ background: "#ea580c", color: "#fff", padding: "0.2rem 0.65rem", borderRadius: 999, fontSize: "0.75rem", fontWeight: 800 }}>
                    MODULE 3
                  </span>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1e293b", margin: 0 }}>
                  Delivery Tracking & Engagement Monitoring
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  Track delivery status and measure how audiences engage with the communication.
                </p>
              </div>

              <button
                onClick={handleRetryFailed}
                disabled={isRetrying || (deliveryMetrics.failed === 0 && deliveryMetrics.retrying === 0)}
                className="btn btn-secondary micro-hover"
                style={{
                  color: "#ea580c",
                  borderColor: "rgba(234,88,12,0.3)",
                  background: "rgba(234,88,12,0.06)",
                  fontWeight: 700,
                }}
              >
                <RotateCw size={14} className={isRetrying ? "animate-spin-slow" : ""} />
                Retry Failed Messages ({deliveryMetrics.failed + deliveryMetrics.retrying})
              </button>
            </div>

            {/* Delivery Tracking Flow Visual Diagram (As in Slide 3) */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(234,88,12,0.04) 0%, rgba(245,158,11,0.04) 100%)",
                border: "1px solid rgba(234,88,12,0.2)",
                borderRadius: 14,
                padding: "1.25rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#ea580c", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                DELIVERY TRACKING FLOW:
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  marginTop: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "Message Sent", icon: Send },
                  { label: "Delivery Processing", icon: Server },
                  { label: "Status Update", icon: CheckCircle2 },
                  { label: "Tracking Dashboard", icon: BarChart2 },
                ].map((fl, idx, arr) => (
                  <div key={fl.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 160 }}>
                    <div
                      style={{
                        background: "#fff",
                        padding: "0.85rem 1rem",
                        borderRadius: 12,
                        border: "1px solid rgba(234,88,12,0.25)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "rgba(234,88,12,0.1)",
                          color: "#ea580c",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <fl.icon size={16} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: "0.82rem", color: "#1e293b" }}>{fl.label}</span>
                    </div>
                    {idx < arr.length - 1 && <span style={{ color: "#94a3b8", fontWeight: 700 }}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* 2-Section KPI Grid: Delivery Status (4 Cards) & Engagement Metrics (4 Cards) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              
              {/* Left Box: Delivery Status (Delivered, Failed, Pending, Retrying) */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1.5px solid rgba(234,88,12,0.2)",
                  borderRadius: 16,
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    Delivery Status
                  </h3>
                  <span className="badge badge-green">Real-Time Ingestion</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                  {/* Delivered */}
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: 12,
                      background: "rgba(16,185,129,0.06)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#10b981",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={18} />
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Delivered</span>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#10b981", margin: 0 }}>
                      {deliveryMetrics.delivered.toLocaleString()}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>
                      ({deliveryMetrics.deliveredPct}%)
                    </span>
                  </div>

                  {/* Failed */}
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: 12,
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#ef4444",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={18} />
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Failed</span>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#ef4444", margin: 0 }}>
                      {deliveryMetrics.failed.toLocaleString()}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 700 }}>
                      ({deliveryMetrics.failedPct}%)
                    </span>
                  </div>

                  {/* Pending */}
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: 12,
                      background: "rgba(245,158,11,0.06)",
                      border: "1px solid rgba(245,158,11,0.25)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#f59e0b",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Clock size={16} />
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Pending</span>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#d97706", margin: 0 }}>
                      {deliveryMetrics.pending.toLocaleString()}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#b45309", fontWeight: 700 }}>
                      ({deliveryMetrics.pendingPct}%)
                    </span>
                  </div>

                  {/* Retrying */}
                  <div
                    style={{
                      padding: "1rem",
                      borderRadius: 12,
                      background: "rgba(59,130,246,0.06)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#3b82f6",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <RotateCw size={16} />
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>Retrying</span>
                    <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#2563eb", margin: 0 }}>
                      {deliveryMetrics.retrying.toLocaleString()}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#1d4ed8", fontWeight: 700 }}>
                      ({deliveryMetrics.retryingPct}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Box: Engagement Metrics (Open Rate, CTR, Responses, Participation) */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1.5px solid rgba(59,130,246,0.2)",
                  borderRadius: 16,
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    Engagement Metrics
                  </h3>
                  <span className="badge badge-purple">Audience Interaction</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {[
                    { label: "Open Rate", count: deliveryMetrics.openRate, pct: deliveryMetrics.openRatePct, icon: Users, color: "#3b82f6" },
                    { label: "Click-Through Rate", count: deliveryMetrics.ctr, pct: deliveryMetrics.ctrPct, icon: MousePointer, color: "#6366f1" },
                    { label: "Responses", count: deliveryMetrics.responses, pct: deliveryMetrics.responsesPct, icon: MessageSquare, color: "#10b981" },
                    { label: "Participation", count: deliveryMetrics.participation, pct: deliveryMetrics.participationPct, icon: Users, color: "#8b5cf6" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.65rem 0.85rem",
                        borderRadius: 10,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: `${m.color}15`,
                            color: m.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <m.icon size={15} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#334155" }}>{m.label}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: 900, fontSize: "1rem", color: m.color }}>
                          {m.count.toLocaleString()}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "#64748b", marginLeft: "0.4rem" }}>
                          ({m.pct}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Retry alert notification if retry was triggered */}
            {retryMessage && (
              <div
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#059669",
                  padding: "0.85rem 1.25rem",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <CheckCircle2 size={16} />
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{retryMessage}</span>
              </div>
            )}

            {/* Detailed Real-Time Delivery Logs Table with Search & Filtering */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0, color: "#1e293b" }}>
                    Real-Time Message Delivery Logs
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "0.78rem", margin: 0 }}>
                    Audit delivery status, carrier latency, and failure reasons per recipient.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  {/* Search */}
                  <div style={{ position: "relative", minWidth: 160 }}>
                    <Search size={13} color="#94a3b8" style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      placeholder="Search recipient..."
                      className="input"
                      style={{ paddingLeft: "2rem", fontSize: "0.78rem", height: 34 }}
                    />
                  </div>

                  {/* Channel Filter */}
                  <select
                    value={logFilterChannel}
                    onChange={(e) => setLogFilterChannel(e.target.value)}
                    className="input select"
                    style={{ width: "auto", fontSize: "0.78rem", height: 34 }}
                  >
                    <option value="all">All Channels</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="push">Push</option>
                    <option value="web_broadcast">Web Broadcast</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={logFilterStatus}
                    onChange={(e) => setLogFilterStatus(e.target.value)}
                    className="input select"
                    style={{ width: "auto", fontSize: "0.78rem", height: 34 }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                    <option value="retrying">Retrying</option>
                  </select>

                  <button
                    onClick={exportLogsCSV}
                    className="btn btn-secondary btn-sm"
                    style={{ height: 34, fontSize: "0.78rem" }}
                  >
                    <Download size={13} /> Export Logs
                  </button>
                </div>
              </div>

              {/* Logs Table */}
              <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                      <th style={{ padding: "0.65rem 0.85rem" }}>Recipient</th>
                      <th style={{ padding: "0.65rem 0.85rem" }}>Channel</th>
                      <th style={{ padding: "0.65rem 0.85rem" }}>Status</th>
                      <th style={{ padding: "0.65rem 0.85rem" }}>Latency</th>
                      <th style={{ padding: "0.65rem 0.85rem" }}>Engagement</th>
                      <th style={{ padding: "0.65rem 0.85rem" }}>Diagnostic / Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                          No delivery logs found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const isDelivered = log.status === "delivered";
                        const isFailed = log.status === "failed";
                        const isRetrying = log.status === "retrying";

                        return (
                          <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "0.65rem 0.85rem" }}>
                              <div style={{ fontWeight: 700, color: "#1e293b" }}>{log.recipient_name}</div>
                              <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{log.recipient_identifier}</div>
                            </td>
                            <td style={{ padding: "0.65rem 0.85rem" }}>
                              <span className="badge badge-purple" style={{ fontSize: "0.68rem", textTransform: "uppercase" }}>
                                {log.channel}
                              </span>
                            </td>
                            <td style={{ padding: "0.65rem 0.85rem" }}>
                              <span
                                className={`badge ${
                                  isDelivered ? "badge-green" : isFailed ? "badge-red" : isRetrying ? "badge-blue" : "badge-amber"
                                }`}
                                style={{ fontSize: "0.7rem" }}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td style={{ padding: "0.65rem 0.85rem", color: "#64748b", fontSize: "0.78rem" }}>
                              {log.latency_ms > 0 ? `${log.latency_ms} ms` : "—"}
                            </td>
                            <td style={{ padding: "0.65rem 0.85rem" }}>
                              <div style={{ display: "flex", gap: "0.25rem" }}>
                                {log.is_opened && <span className="badge badge-blue" style={{ fontSize: "0.65rem" }}>Opened</span>}
                                {log.is_clicked && <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>Clicked</span>}
                                {log.has_response && <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>Replied</span>}
                                {!log.is_opened && <span style={{ color: "#cbd5e1", fontSize: "0.75rem" }}>—</span>}
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "0.65rem 0.85rem",
                                fontSize: "0.75rem",
                                color: log.failure_reason ? "#dc2626" : "#059669",
                              }}
                            >
                              {log.failure_reason || "Delivered successfully with zero carrier drop"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Features & Outcome Banner (Matches Slide 3) */}
            <div
              style={{
                background: "rgba(234,88,12,0.04)",
                border: "1px solid rgba(234,88,12,0.2)",
                borderRadius: 14,
                padding: "1.1rem 1.25rem",
              }}
            >
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#ea580c", marginBottom: "0.6rem", textTransform: "uppercase" }}>
                Key Features (Module 3):
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.82rem", color: "#475569" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#ea580c" /> Real-time delivery status for every message.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#ea580c" /> Track opens, clicks, responses and participation.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#ea580c" /> Retry mechanism for failed messages.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#ea580c" /> Detailed logs for audit and analysis.
                </div>
              </div>
            </div>

            {/* Outcome Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(234,88,12,0.1) 0%, rgba(245,158,11,0.08) 100%)",
                border: "1px solid rgba(234,88,12,0.3)",
                borderRadius: 12,
                padding: "0.85rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <span className="badge badge-amber" style={{ fontSize: "0.75rem", fontWeight: 800 }}>
                OUTCOME
              </span>
              <span style={{ fontSize: "0.9rem", color: "#9a3412", fontWeight: 700 }}>
                Know where the message is, who received it, and how the audience interacted with it.
              </span>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* MODULE 4: FEEDBACK & SENTIMENT ANALYSIS DASHBOARD                         */}
        {/* ========================================================================= */}
        {(activeModule === "all" || activeModule === 4) && (
          <section
            id="module-4"
            className="card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: 18,
            }}
          >
            {/* Module 4 Header Badge & Title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <span
                    style={{
                      background: "#1e293b",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "0.9rem",
                    }}
                  >
                    4
                  </span>
                  <span style={{ background: "#7c3aed", color: "#fff", padding: "0.2rem 0.65rem", borderRadius: 999, fontSize: "0.75rem", fontWeight: 800 }}>
                    MODULE 4
                  </span>
                </div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1e293b", margin: 0 }}>
                  Feedback & Sentiment Analysis Dashboard
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  Collect feedback, analyze sentiment and visualize insights through interactive dashboards.
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span className="badge badge-purple" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                  Avg Sentiment Score: 0.86 / 1.0
                </span>
              </div>
            </div>

            {/* Feedback & Sentiment Flow Visual Diagram (As in Slide 4) */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(99,102,241,0.04) 100%)",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: 14,
                padding: "1.25rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                FEEDBACK & SENTIMENT FLOW:
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  marginTop: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "Collect Feedback", desc: "Forms, Replies, Comments", icon: MessageSquare },
                  { label: "Sentiment Analysis", desc: "AI / NLP Model", icon: Sparkles },
                  { label: "Classification", desc: "Positive | Neutral | Negative", icon: ThumbsUp },
                  { label: "Dashboard Insights", desc: "Visual interactive charts", icon: BarChart3 },
                ].map((fl, idx, arr) => (
                  <div key={fl.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1, minWidth: 160 }}>
                    <div
                      style={{
                        background: "#fff",
                        padding: "0.85rem 1rem",
                        borderRadius: 12,
                        border: "1px solid rgba(124,58,237,0.25)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "rgba(124,58,237,0.1)",
                          color: "#7c3aed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <fl.icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: "0.82rem", color: "#1e293b" }}>{fl.label}</div>
                        <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{fl.desc}</div>
                      </div>
                    </div>
                    {idx < arr.length - 1 && <span style={{ color: "#94a3b8", fontWeight: 700 }}>→</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preview Component (Exact mockup matching Slide 4) */}
            <div
              style={{
                background: "#ffffff",
                border: "1.5px solid rgba(124,58,237,0.25)",
                borderRadius: 16,
                padding: "1.5rem",
                boxShadow: "0 10px 30px -10px rgba(124,58,237,0.12)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                  Dashboard Preview
                </h3>
                <span className="badge badge-purple" style={{ fontSize: "0.75rem", fontWeight: 800 }}>
                  Live Sentiment Analytics
                </span>
              </div>

              {/* 4 Summary Cards (Total Sent: 10,000 | Delivered: 9,500 | Open Rate: 85% | CTR: 32%) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
                {[
                  { label: "Total Sent", value: "10,000", color: "#3b82f6" },
                  { label: "Delivered", value: "9,500", color: "#10b981" },
                  { label: "Open Rate", value: "85%", color: "#6366f1" },
                  { label: "CTR", value: "32%", color: "#8b5cf6" },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 12,
                      padding: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      {s.label}
                    </span>
                    <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: s.color, margin: "0.25rem 0 0" }}>
                      {s.value}
                    </h3>
                  </div>
                ))}
              </div>

              {/* Two Visual Analytics Columns: Donut Sentiment & Engagement Trend */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "1.5rem" }}>
                
                {/* Donut Chart / Radial Sentiment Overview */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b" }}>
                    Sentiment Overview
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", justifyContent: "center" }}>
                    {/* SVG Donut Chart with Exact Percentages (65% Pos, 25% Neu, 10% Neg) */}
                    <div style={{ position: "relative", width: 140, height: 140 }}>
                      <svg width="140" height="140" viewBox="0 0 42 42">
                        {/* Background ring */}
                        <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
                        
                        {/* Positive segment (65%) */}
                        <circle
                          cx="21"
                          cy="21"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke="#10b981"
                          strokeWidth="6"
                          strokeDasharray={`${sentimentBreakdown.positive_pct} ${100 - sentimentBreakdown.positive_pct}`}
                          strokeDashoffset="25"
                        />
                        
                        {/* Neutral segment (25%) */}
                        <circle
                          cx="21"
                          cy="21"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke="#f59e0b"
                          strokeWidth="6"
                          strokeDasharray={`${sentimentBreakdown.neutral_pct} ${100 - sentimentBreakdown.neutral_pct}`}
                          strokeDashoffset={`${25 - sentimentBreakdown.positive_pct}`}
                        />

                        {/* Negative segment (10%) */}
                        <circle
                          cx="21"
                          cy="21"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke="#ef4444"
                          strokeWidth="6"
                          strokeDasharray={`${sentimentBreakdown.negative_pct} ${100 - sentimentBreakdown.negative_pct}`}
                          strokeDashoffset={`${25 - sentimentBreakdown.positive_pct - sentimentBreakdown.neutral_pct}`}
                        />
                      </svg>
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#10b981" }}>
                          {sentimentBreakdown.positive_pct}%
                        </span>
                        <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 700 }}>POSITIVE</span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: "#10b981" }} />
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>Positive:</span>
                        <strong style={{ fontSize: "0.85rem", color: "#10b981" }}>{sentimentBreakdown.positive_pct}%</strong>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: "#f59e0b" }} />
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>Neutral:</span>
                        <strong style={{ fontSize: "0.85rem", color: "#d97706" }}>{sentimentBreakdown.neutral_pct}%</strong>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: "#ef4444" }} />
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#334155" }}>Negative:</span>
                        <strong style={{ fontSize: "0.85rem", color: "#dc2626" }}>{sentimentBreakdown.negative_pct}%</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engagement Trend Multi-Line Graph */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    padding: "1.25rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1e293b" }}>
                      Engagement Trend (Time-Series)
                    </span>
                    <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.7rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#10b981", fontWeight: 700 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} /> Delivery
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: "#3b82f6", fontWeight: 700 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} /> Opens
                      </span>
                    </div>
                  </div>

                  {/* SVG Multi-Line Chart */}
                  <div style={{ height: 120, width: "100%", position: "relative" }}>
                    <svg width="100%" height="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="20" x2="300" y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
                      <line x1="0" y1="50" x2="300" y2="50" stroke="#e2e8f0" strokeDasharray="3 3" />
                      <line x1="0" y1="80" x2="300" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />
                      
                      {/* Green Line (Delivery) */}
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points="10,75 50,45 90,60 130,25 170,40 210,18 250,35 290,12"
                      />
                      
                      {/* Blue Line (Opens & CTR) */}
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points="10,88 50,70 90,78 130,55 170,68 210,48 250,58 290,42"
                      />
                    </svg>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8" }}>
                    <span>06:00 AM</span>
                    <span>10:00 AM</span>
                    <span>02:00 PM</span>
                    <span>06:00 PM</span>
                    <span>10:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Live Audience Responses Stream */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#1e293b", margin: 0 }}>
                    Audience Feedback Responses Stream ({feedbackList.length})
                  </h4>
                  <span className="badge badge-green">AI Classified</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                  {feedbackList.map((fb) => {
                    const isPos = fb.sentiment === "positive";
                    const isNeg = fb.sentiment === "negative";
                    return (
                      <div
                        key={fb.id}
                        style={{
                          background: "#f8fafc",
                          border: `1px solid ${isPos ? "rgba(16,185,129,0.3)" : isNeg ? "rgba(239,68,68,0.3)" : "#e2e8f0"}`,
                          borderRadius: 12,
                          padding: "1rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e293b" }}>{fb.recipient_name}</span>
                          <span
                            className={`badge ${isPos ? "badge-green" : isNeg ? "badge-red" : "badge-amber"}`}
                            style={{ fontSize: "0.68rem" }}
                          >
                            {isPos ? <ThumbsUp size={10} /> : isNeg ? <ThumbsDown size={10} /> : <MinusCircle size={10} />}
                            {fb.sentiment.toUpperCase()} ({Math.round(fb.sentiment_score * 100)}%)
                          </span>
                        </div>
                        <p style={{ fontSize: "0.8rem", color: "#334155", fontStyle: "italic", margin: 0, lineHeight: 1.4 }}>
                          "{fb.feedback_text}"
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#94a3b8", paddingTop: "0.3rem" }}>
                          <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>{fb.key_theme}</span>
                          <span>via {fb.channel.toUpperCase()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulate Audience Response & NLP Sentiment Analysis */}
              <form
                onSubmit={handleFeedbackSubmit}
                style={{
                  background: "linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(99,102,241,0.04) 100%)",
                  border: "1.5px dashed rgba(124,58,237,0.3)",
                  borderRadius: 14,
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Sparkles size={16} color="#7c3aed" />
                  <h4 style={{ fontWeight: 800, fontSize: "0.9rem", color: "#7c3aed", margin: 0 }}>
                    Simulate / Capture Audience Feedback (AI Sentiment Analysis):
                  </h4>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                  <input
                    type="text"
                    placeholder="Recipient Name (e.g. Ramesh Patel)"
                    value={fbName}
                    onChange={(e) => setFbName(e.target.value)}
                    className="input"
                    style={{ fontSize: "0.82rem" }}
                  />
                  <select
                    value={fbChannel}
                    onChange={(e) => setFbChannel(e.target.value)}
                    className="input select"
                    style={{ fontSize: "0.82rem" }}
                  >
                    <option value="whatsapp">WhatsApp Reply</option>
                    <option value="sms">SMS Gateway Reply</option>
                    <option value="email">Email Response</option>
                    <option value="push">Push Survey In-App</option>
                  </select>
                  <select
                    value={fbLang}
                    onChange={(e) => setFbLang(e.target.value)}
                    className="input select"
                    style={{ fontSize: "0.82rem" }}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    type="text"
                    placeholder="Type audience feedback (e.g. 'Very clear instructions on dengue prevention in Hindi!')..."
                    value={fbText}
                    onChange={(e) => setFbText(e.target.value)}
                    className="input"
                    style={{ fontSize: "0.85rem", flex: 1 }}
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingFb || !fbText.trim()}
                    className="btn btn-primary"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                      borderColor: "#7c3aed",
                      fontSize: "0.85rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Sparkles size={14} /> Analyze & Record
                  </button>
                </div>
              </form>
            </div>

            {/* Features & Outcome Banner (Matches Slide 4) */}
            <div
              style={{
                background: "rgba(124,58,237,0.04)",
                border: "1px solid rgba(124,58,237,0.2)",
                borderRadius: 14,
                padding: "1.1rem 1.25rem",
              }}
            >
              <h4 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#7c3aed", marginBottom: "0.6rem", textTransform: "uppercase" }}>
                Key Features (Module 4):
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.82rem", color: "#475569" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#7c3aed" /> Capture feedback from replies, forms and surveys.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#7c3aed" /> AI-powered sentiment analysis (Positive, Neutral, Negative).
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#7c3aed" /> Identify trends and issues in audience responses.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#7c3aed" /> Drill-down analytics by channel, language, location, campaign.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Check size={14} color="#7c3aed" /> Export reports for stakeholders.
                </div>
              </div>
            </div>

            {/* Outcome Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(99,102,241,0.08) 100%)",
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: 12,
                padding: "0.85rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <span className="badge badge-purple" style={{ fontSize: "0.75rem", fontWeight: 800 }}>
                OUTCOME
              </span>
              <span style={{ fontSize: "0.9rem", color: "#5b21b6", fontWeight: 700 }}>
                Understand audience sentiment and campaign performance to improve future communication.
              </span>
            </div>
          </section>
        )}

      </div>

      {/* API Key / Channel Configuration Modal */}
      {selectedChannelForConfig && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 520,
              width: "100%",
              borderRadius: 18,
              padding: "1.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: selectedChannelForConfig.color,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <selectedChannelForConfig.icon size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0 }}>
                    Configure {selectedChannelForConfig.name}
                  </h3>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{selectedChannelForConfig.provider}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedChannelForConfig(null)}
                className="btn btn-ghost btn-sm"
                style={{ padding: "0.3rem" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveChannelConfig} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="label" style={{ fontSize: "0.8rem" }}>API Key / Auth Token</label>
                <input
                  type="text"
                  value={selectedChannelForConfig.apiKeyMasked}
                  onChange={(e) =>
                    setSelectedChannelForConfig({
                      ...selectedChannelForConfig,
                      apiKeyMasked: e.target.value,
                    })
                  }
                  className="input"
                  style={{ fontFamily: "monospace" }}
                />
              </div>

              <div>
                <label className="label" style={{ fontSize: "0.8rem" }}>Sender ID / From Verified Identity</label>
                <input
                  type="text"
                  value={selectedChannelForConfig.senderId}
                  onChange={(e) =>
                    setSelectedChannelForConfig({
                      ...selectedChannelForConfig,
                      senderId: e.target.value,
                    })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="label" style={{ fontSize: "0.8rem" }}>Webhook Status URL</label>
                <input
                  type="text"
                  value={selectedChannelForConfig.webhookUrl}
                  onChange={(e) =>
                    setSelectedChannelForConfig({
                      ...selectedChannelForConfig,
                      webhookUrl: e.target.value,
                    })
                  }
                  className="input"
                  style={{ fontSize: "0.8rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label className="label" style={{ fontSize: "0.8rem" }}>Rate Limit (req/sec)</label>
                  <input
                    type="number"
                    value={selectedChannelForConfig.rateLimit}
                    onChange={(e) =>
                      setSelectedChannelForConfig({
                        ...selectedChannelForConfig,
                        rateLimit: Number(e.target.value),
                      })
                    }
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" style={{ fontSize: "0.8rem" }}>Channel State</label>
                  <select
                    value={selectedChannelForConfig.enabled ? "enabled" : "disabled"}
                    onChange={(e) =>
                      setSelectedChannelForConfig({
                        ...selectedChannelForConfig,
                        enabled: e.target.value === "enabled",
                      })
                    }
                    className="input select"
                  >
                    <option value="enabled">Enabled & Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setSelectedChannelForConfig(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon helper
function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}
