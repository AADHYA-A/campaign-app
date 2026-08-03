"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3, Users, MessageSquare, Zap, Loader2 } from "lucide-react";
import { generateCampaign, CampaignResponse } from "@/services/api";

const mockData = [
  { name: "Mon", engagement: 4000, conversion: 2400 },
  { name: "Tue", engagement: 3000, conversion: 1398 },
  { name: "Wed", engagement: 2000, conversion: 9800 },
  { name: "Thu", engagement: 2780, conversion: 3908 },
  { name: "Fri", engagement: 1890, conversion: 4800 },
  { name: "Sat", engagement: 2390, conversion: 3800 },
  { name: "Sun", engagement: 3490, conversion: 4300 },
];

export default function Dashboard() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CampaignResponse | null>(null);
  
  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const data = await generateCampaign({ topic, tone: "professional", target_lang: "hin" });
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate campaign");
    } finally {
      setLoading(false);
      setTopic("");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Campaigns Hub
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Multilingual reach and analytics.</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2.5 rounded-full bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all font-medium">
              Export Data
            </button>
            <button className="px-6 py-2.5 rounded-full bg-indigo-600 text-white shadow-lg glow hover:bg-indigo-700 transition-all font-medium">
              + New Campaign
            </button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Reach", value: "2.4M", icon: Users, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },
            { label: "Active Campaigns", value: "14", icon: Zap, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30" },
            { label: "Translations", value: "85K", icon: MessageSquare, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30" },
            { label: "Avg Engagement", value: "68%", icon: BarChart3, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" }
          ].map((stat, i) => (
            <div key={i} className="glass p-6 rounded-3xl micro-hover">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts & AI insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass rounded-3xl p-6 micro-hover">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Engagement Trends</h3>
              <select className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="engagement" stroke="#6366f1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="conversion" stroke="#a855f7" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass rounded-3xl p-6 flex flex-col micro-hover">
            <h3 className="text-xl font-bold mb-4">AI Campaign Assistant</h3>
            <div className="flex-1 bg-white/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/50 overflow-y-auto mb-4 flex flex-col gap-4">
              
              <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-2xl rounded-tl-none w-[85%] text-indigo-900 dark:text-indigo-100 text-sm">
                Your recent Diwali campaign in Hindi and Marathi is seeing 45% higher engagement than English. Want to generate more content in these languages?
              </div>
              
              {result && (
                <div className="bg-white dark:bg-slate-700 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-600 text-sm animate-in slide-in-from-bottom-2 fade-in">
                  <p className="font-semibold mb-2 flex items-center justify-between">
                    Draft: {result.topic} 
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Sentiment: {result.sentiment.sentiment}
                    </span>
                  </p>
                  <p className="mb-4 text-slate-600 dark:text-slate-300">{result.original_content}</p>
                  
                  <div className="border-t border-slate-200 dark:border-slate-600 pt-3 mt-3">
                    <p className="text-xs text-slate-400 mb-1">Indic Translation (Hindi)</p>
                    <p className="text-slate-600 dark:text-slate-300">{result.translated_content}</p>
                  </div>
                </div>
              )}

            </div>
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Ask AI to draft a campaign..." 
                className="w-full bg-white dark:bg-slate-800 border-none rounded-full py-3 px-5 pr-12 focus:ring-2 focus:ring-indigo-500 shadow-sm outline-none"
              />
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="absolute right-2 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
