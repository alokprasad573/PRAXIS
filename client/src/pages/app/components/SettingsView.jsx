import { useState } from "react";
import {
  User,
  ShieldCheck,
  CreditCard,
  Cpu,
  Database,
  Key,
  Shield,
  Laptop,
  Terminal,
  GitBranch,
  Save,
  Plus,
  Copy,
  Trash2,
  Check,
  Activity,
} from "lucide-react";

const SettingsView = ({ onToast = () => {} }) => {
  const [activeTab, setActiveTab] = useState("profile");

  const navGroups = [
    {
      title: "Account",
      items: [
        { id: "profile", label: "User Profile", icon: User },
        { id: "security", label: "Security & Auth", icon: ShieldCheck },
        { id: "billing", label: "Billing & Quotas", icon: CreditCard },
      ],
    },
    {
      title: "Integrations",
      items: [
        { id: "llm", label: "LLM Gateway Config", icon: Cpu },
        { id: "vectordb", label: "VectorDB (Qdrant/Pinecone)", icon: Database },
      ],
    },
    {
      title: "Governance",
      items: [{ id: "apikeys", label: "API Keys & Tokens", icon: Key }],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-cream-100 tracking-tight">
          Platform Settings
        </h1>
        <p className="text-xs text-[#b8ab97] font-mono mt-1">
          Configure models, vector embeddings, OKF guardrails, and enterprise
          preferences.
        </p>
      </div>

      <div className="bg-dark-card border border-[#201d1a] rounded-xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row gap-8">
        {/* Left Sub-nav */}
        <div className="w-full md:w-64 shrink-0 space-y-6 md:pr-6 md:border-r border-[#201d1a] font-mono text-xs">
          {navGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-[10px] font-bold text-orange-400/80 uppercase tracking-widest mb-2.5 px-2">
                {group.title}
              </h3>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.id === activeTab;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all ${
                        isActive
                          ? "bg-orange-500/15 text-orange-300 font-bold border border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.15)]"
                          : "text-[#8a7f70] hover:text-cream-100 hover:bg-[#14151b] border border-transparent"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${isActive ? "text-orange-400" : "text-[#8a7f70]"}`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* 1. Profile */}
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-3xl font-mono text-xs animate-fadeInUp">
              <div>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#201d1a]">
                  <div>
                    <h3 className="text-base font-bold text-cream-100">
                      User Profile & Identity
                    </h3>
                    <p className="text-[11px] text-[#8a7f70] mt-0.5">
                      Manage your personal workspace identity and notification
                      channels.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                    Verified Admin
                  </span>
                </div>

                <div className="flex items-center gap-5 mb-8 p-4 rounded-xl bg-[#090a0e] border border-[#201d1a]">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-trrom-orange-600 to-amber-500 flex items-center justify-center text-xl font-extrabold text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-orange-400/40">
                    AP
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-cream-100">
                        Alok Prasad
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                        ORG ADMIN
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8a7f70]">
                      alok@praxis.internal · Primary Workspace Owner
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() =>
                          onToast("Avatar upload modal opened", "info")
                        }
                        className="border border-[#282420] text-[#d6c5a8] px-3 py-1 rounded-lg hover:border-orange-500/40 hover:text-white transition-colors bg-dark-card text-[10px]"
                      >
                        Change Photo
                      </button>
                      <button
                        onClick={() =>
                          onToast("Avatar reset to initials", "warning")
                        }
                        className="text-[#8a7f70] hover:text-rose-400 px-2 py-1 text-[10px] transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[#a89f91] uppercase text-[10px] mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Alok Prasad"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a89f91] uppercase text-[10px] mb-1.5">
                      Work Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="alok@praxis.internal"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-[#a89f91] uppercase text-[10px] mb-1.5">
                      Default Workspace
                    </label>
                    <select
                      defaultValue="Acme Corp Engineering"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    >
                      <option>Acme Corp Engineering</option>
                      <option>Payments Infrastructure</option>
                      <option>AI Research Lab</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#a89f91] uppercase text-[10px] mb-1.5">
                      Interface Timezone
                    </label>
                    <select
                      defaultValue="UTC+05:30 (Asia/Kolkata - IST)"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    >
                      <option>UTC+05:30 (Asia/Kolkata - IST)</option>
                      <option>UTC+00:00 (UTC)</option>
                      <option>UTC-08:00 (America/Los_Angeles - PST)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#201d1a] flex items-center justify-between">
                <span className="text-[11px] text-[#8a7f70]">
                  Changes take effect immediately across all active agent
                  workers.
                </span>
                <button
                  onClick={() =>
                    onToast(
                      "Profile configuration saved successfully",
                      "success",
                    )
                  }
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.35)] flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" /> Save Profile
                </button>
              </div>
            </div>
          )}

          {/* 2. Security */}
          {activeTab === "security" && (
            <div className="space-y-6 max-w-3xl font-mono text-xs animate-fadeInUp">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#201d1a]">
                <div>
                  <h3 className="text-base font-bold text-cream-100">
                    Security & Access Governance
                  </h3>
                  <p className="text-[11px] text-[#8a7f70] mt-0.5">
                    Two-factor authentication, active session tokens, and OKF
                    security policies.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[10px] font-bold flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-orange-400" /> Strict Policy
                  Active
                </span>
              </div>

              {/* 2FA Box */}
              <div className="p-5 rounded-xl bg-[#090a0e] border border-[#201d1a] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cream-100">
                      Two-Factor Authentication (TOTP)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/30">
                      ENABLED
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8a7f70]">
                    Hardware keys (YubiKey) or Authenticator app (1Password,
                    Google Authenticator) required on login.
                  </p>
                </div>
                <button
                  onClick={() =>
                    onToast("Reconfiguring 2FA hardware key...", "info")
                  }
                  className="border border-[#282420] text-[#d6c5a8] hover:border-orange-500/40 hover:text-cream-100 px-3.5 py-2 rounded-lg bg-dark-card transition-colors whitespace-nowrap"
                >
                  Manage Keys
                </button>
              </div>

              {/* Password Change */}
              <div className="p-5 rounded-xl bg-[#090a0e] border border-[#201d1a] space-y-4">
                <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">
                  Change Master Password
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#a89f91] text-[10px] uppercase mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2 text-cream-100 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a89f91] text-[10px] uppercase mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2 text-cream-100 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a89f91] text-[10px] uppercase mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2 text-cream-100 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() =>
                      onToast("Password updated successfully", "success")
                    }
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">
                    Active Device Sessions
                  </h4>
                  <button
                    onClick={() =>
                      onToast("Revoked all other active sessions", "warning")
                    }
                    className="text-rose-400 hover:text-rose-300 text-[10px] font-bold"
                  >
                    Revoke All Others
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-lg bg-[#090a0e] border border-orange-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Laptop className="w-4 h-4 text-orange-400" />
                      <div>
                        <div className="text-xs text-cream-100 font-bold">
                          macOS 15.1 · Chrome 130.0{" "}
                          <span className="text-[9px] text-emerald-400 font-normal ml-2">
                            (Current Session)
                          </span>
                        </div>
                        <div className="text-[10px] text-[#8a7f70]">
                          IP: 103.120.201.44 · Bangalore, IN
                        </div>
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#090a0e] border border-[#201d1a] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Terminal className="w-4 h-4 text-[#8a7f70]" />
                      <div>
                        <div className="text-xs text-cream-100 font-bold">
                          PRAXIS CLI daemon v2.0 · Linux Kernel 6.8
                        </div>
                        <div className="text-[10px] text-[#8a7f70]">
                          IP: 34.120.45.12 · Last active 12m ago
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onToast("CLI session revoked", "info")}
                      className="text-[10px] text-[#8a7f70] hover:text-rose-400 transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Billing */}
          {activeTab === "billing" && (
            <div className="space-y-6 max-w-3xl font-mono text-xs animate-fadeInUp">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#201d1a]">
                <div>
                  <h3 className="text-base font-bold text-cream-100">
                    Billing & Token Quotas
                  </h3>
                  <p className="text-[11px] text-[#8a7f70] mt-0.5">
                    Manage enterprise plan, LLM usage budgets, and automated
                    cost caps.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-linear-to-r from-orange-500/20 to-amber-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-bold">
                  ENTERPRISE TIER
                </span>
              </div>

              {/* Plan Card */}
              <div className="p-6 rounded-2xl bg-linear-to-brrom-[#12131a] to-[#0a0b10] border border-orange-500/30 shadow-[0_10px_30px_rgba(249,115,22,0.08)] relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-1">
                      Current Active Plan
                    </div>
                    <h4 className="text-2xl font-extrabold text-cream-100">
                      Enterprise Dedicated Swarm
                    </h4>
                    <p className="text-[11px] text-[#b8ab97] mt-1">
                      Unlimited concurrent agents · Dedicated VectorDB shard ·
                      99.99% SLA
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-400">
                      $499
                      <span className="text-xs text-[#8a7f70] font-normal">
                        /mo
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">
                      Renews Oct 1, 2026
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Usage & Budget Meter */}
              <div className="p-5 rounded-xl bg-[#090a0e] border border-[#201d1a] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">
                      Monthly Token Consumption
                    </h4>
                    <p className="text-[10px] text-[#8a7f70] mt-0.5">
                      Automated soft-cap at $100.00 · Hard-stop at $150.00
                    </p>
                  </div>
                  <span className="text-sm font-bold text-orange-400 font-mono">
                    $12.84{" "}
                    <span className="text-[10px] text-[#8a7f70]">
                      / $100.00 (12.8%)
                    </span>
                  </span>
                </div>

                <div className="bg-[#181922] rounded-full h-2 overflow-hidden border border-[#25221e]">
                  <div
                    className="bg-linear-to-rrom-orange-500 to-amber-400 h-2 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.7)]"
                    style={{ width: "12.8%" }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="p-2.5 rounded-lg bg-dark-card border border-[#201d1a]">
                    <div className="text-[10px] text-[#8a7f70] uppercase">
                      GPT-4o Tokens
                    </div>
                    <div className="text-sm font-bold text-cream-100 mt-0.5">
                      2.8M ($8.40)
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-dark-card border border-[#201d1a]">
                    <div className="text-[10px] text-[#8a7f70] uppercase">
                      Claude 3.5 Sonnet
                    </div>
                    <div className="text-sm font-bold text-cream-100 mt-0.5">
                      1.4M ($4.20)
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-dark-card border border-[#201d1a]">
                    <div className="text-[10px] text-[#8a7f70] uppercase">
                      Vector Embedding
                    </div>
                    <div className="text-sm font-bold text-cream-100 mt-0.5">
                      48.2k ($0.24)
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="p-5 rounded-xl bg-[#090a0e] border border-[#201d1a] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-8 rounded bg-[#181922] border border-[#282420] flex items-center justify-center font-bold text-[10px] text-white">
                    VISA
                  </div>
                  <div>
                    <div className="text-xs text-cream-100 font-bold">
                      Visa ending in •••• 4242
                    </div>
                    <div className="text-[10px] text-[#8a7f70]">
                      Expires 08/29 · Primary Billing Method
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onToast("Payment method update opened", "info")
                  }
                  className="border border-[#282420] text-[#d6c5a8] hover:border-orange-500/40 hover:text-white px-3 py-1.5 rounded-lg bg-dark-card transition-colors"
                >
                  Update Card
                </button>
              </div>
            </div>
          )}

          {/* 4. LLM Gateway */}
          {activeTab === "llm" && (
            <div className="space-y-6 max-w-3xl font-mono text-xs animate-fadeInUp">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#201d1a]">
                <div>
                  <h3 className="text-base font-bold text-cream-100">
                    LLM Gateway & Intelligent Model Router
                  </h3>
                  <p className="text-[11px] text-[#8a7f70] mt-0.5">
                    Define fallback latency routing, temperature presets, and
                    provider API keys.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                  4 Providers Connected
                </span>
              </div>

              {/* Model Routing Strategy */}
              <div className="p-5 rounded-xl bg-[#090a0e] border border-[#201d1a] space-y-4">
                <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-orange-400" />
                  Agent Model Dispatch Rules
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#a89f91] text-[10px] uppercase mb-1.5">
                      Code Analysis & Security Agent
                    </label>
                    <select
                      defaultValue="OpenAI - GPT-4o (2024-11-20)"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    >
                      <option>OpenAI - GPT-4o (2024-11-20)</option>
                      <option>Anthropic - Claude 3.5 Sonnet</option>
                      <option>DeepSeek - DeepSeek-V3 / R1</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a89f91] text-[10px] uppercase mb-1.5">
                      Unit Test Fix Loop & Refactoring
                    </label>
                    <select
                      defaultValue="Anthropic - Claude 3.5 Sonnet (v2)"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    >
                      <option>Anthropic - Claude 3.5 Sonnet (v2)</option>
                      <option>OpenAI - GPT-4o</option>
                      <option>Google - Gemini 2.0 Flash</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[#a89f91] text-[10px] uppercase mb-1.5">
                      Research & RAG Summarizer
                    </label>
                    <select
                      defaultValue="Google - Gemini 1.5 Pro"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    >
                      <option>Google - Gemini 1.5 Pro</option>
                      <option>OpenAI - GPT-4o-mini</option>
                      <option>Mistral - Codestral 2501</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a89f91] text-[10px] uppercase mb-1.5">
                      Automated Fallback Circuit
                    </label>
                    <select
                      defaultValue="Auto-fallback to Claude 3.5 on rate-limit"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    >
                      <option>Auto-fallback to Claude 3.5 on rate-limit</option>
                      <option>
                        Strict failure (No cross-provider fallback)
                      </option>
                      <option>Retry local vLLM / Ollama instance</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Provider API Credentials */}
              <div className="p-5 rounded-xl bg-[#090a0e] border border-[#201d1a] space-y-4">
                <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">
                  Provider API Credentials
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#a89f91] text-[10px] uppercase">
                        OpenAI API Key
                      </label>
                      <span className="text-[10px] text-emerald-400">
                        ✓ Live Connected
                      </span>
                    </div>
                    <input
                      type="password"
                      defaultValue="sk-proj-94kd829a8f27b9c02d1847291a"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#a89f91] text-[10px] uppercase">
                        Anthropic API Key
                      </label>
                      <span className="text-[10px] text-emerald-400">
                        ✓ Live Connected
                      </span>
                    </div>
                    <input
                      type="password"
                      defaultValue="sk-ant-api03-88291048201847192847192"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#a89f91] text-[10px] uppercase">
                        Local vLLM / Ollama Gateway URL
                      </label>
                      <span className="text-[10px] text-[#8a7f70]">
                        Optional for on-premise execution
                      </span>
                    </div>
                    <input
                      type="text"
                      defaultValue="http://localhost:11434/v1"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() =>
                    onToast(
                      "LLM Gateway settings updated and tested",
                      "success",
                    )
                  }
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.35)] flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" /> Save Gateway Config
                </button>
              </div>
            </div>
          )}

          {/* 5. VectorDB */}
          {activeTab === "vectordb" && (
            <div className="space-y-6 max-w-3xl font-mono text-xs animate-fadeInUp">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#201d1a]">
                <div>
                  <h3 className="text-base font-bold text-cream-100">
                    Vector Database & RAG Indexing Cluster
                  </h3>
                  <p className="text-[11px] text-[#8a7f70] mt-0.5">
                    Semantic code embeddings, AST chunking thresholds, and
                    collection metrics.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[10px] font-bold flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-orange-400" /> Qdrant
                  Cluster v1.11
                </span>
              </div>

              {/* Vector Engine Selection */}
              <div className="p-5 rounded-xl bg-[#090a0e] border border-[#201d1a] space-y-4">
                <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">
                  Active Vector Database Provider
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-orange-500/15 border border-orange-500/40 text-orange-300 font-bold flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Qdrant Cloud</span>
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                    </div>
                    <span className="text-[10px] text-[#b8ab97] font-normal mt-2">
                      High-performance Rust engine with HNSW indexing.
                    </span>
                  </div>

                  <div
                    onClick={() =>
                      onToast("Switched to Pinecone connector", "info")
                    }
                    className="p-3.5 rounded-xl bg-dark-base border border-[#26231f] text-[#8a7f70] hover:text-cream-100 hover:border-orange-500/30 cursor-pointer transition-colors flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Pinecone</span>
                    </div>
                    <span className="text-[10px] text-[#8a7f70] font-normal mt-2">
                      Serverless managed vector index.
                    </span>
                  </div>

                  <div
                    onClick={() =>
                      onToast("Switched to Milvus connector", "info")
                    }
                    className="p-3.5 rounded-xl bg-dark-base border border-[#26231f] text-[#8a7f70] hover:text-cream-100 hover:border-orange-500/30 cursor-pointer transition-colors flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Milvus / Chroma</span>
                    </div>
                    <span className="text-[10px] text-[#8a7f70] font-normal mt-2">
                      Self-hosted local container instance.
                    </span>
                  </div>
                </div>
              </div>

              {/* Connection Parameters */}
              <div className="p-5 rounded-xl bg-[#090a0e] border border-[#201d1a] space-y-4">
                <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">
                  Cluster Connection Parameters
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#a89f91] text-[10px] uppercase mb-1.5">
                      Cluster Endpoint URL
                    </label>
                    <input
                      type="text"
                      defaultValue="https://praxis-prod-vectordb.qdrant.tech:6333"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#a89f91] text-[10px] uppercase mb-1.5">
                      Collection API Read/Write Key
                    </label>
                    <input
                      type="password"
                      defaultValue="qdrant-sec-884910482019482910482"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-[#a89f91] text-[10px] uppercase mb-1.5">
                      Embedding Model
                    </label>
                    <select
                      defaultValue="text-embedding-3-large (3072 dims)"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    >
                      <option>text-embedding-3-large (3072 dims)</option>
                      <option>text-embedding-3-small (1536 dims)</option>
                      <option>Cohere embed-english-v3.0</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#a89f91] text-[10px] uppercase mb-1.5">
                      AST Chunk Size
                    </label>
                    <input
                      type="number"
                      defaultValue={512}
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#a89f91] text-[10px] uppercase mb-1.5">
                      Similarity Threshold
                    </label>
                    <input
                      type="text"
                      defaultValue="0.82 (Cosine)"
                      className="w-full bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() =>
                    onToast(
                      "Running VectorDB health check: 104,821 vectors indexed, latency 1.4ms",
                      "success",
                    )
                  }
                  className="border border-[#282420] text-[#d6c5a8] hover:border-orange-500/40 hover:text-white px-4 py-2.5 rounded-lg bg-dark-card transition-colors flex items-center gap-2"
                >
                  <Activity className="w-3.5 h-3.5 text-orange-400" /> Test
                  Connection
                </button>

                <button
                  onClick={() =>
                    onToast(
                      "VectorDB configuration saved and re-indexed",
                      "success",
                    )
                  }
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-[0_0_12px_rgba(249,115,22,0.35)] flex items-center gap-2"
                >
                  <Check className="w-3.5 h-3.5" /> Save Vector Settings
                </button>
              </div>
            </div>
          )}

          {/* 6. API Keys */}
          {activeTab === "apikeys" && (
            <div className="space-y-6 max-w-3xl font-mono text-xs animate-fadeInUp">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#201d1a]">
                <div>
                  <h3 className="text-base font-bold text-cream-100">
                    API Keys & Access Tokens
                  </h3>
                  <p className="text-[11px] text-[#8a7f70] mt-0.5">
                    Generate scoped developer tokens for PRAXIS CLI, CI/CD
                    webhooks, and REST API automation.
                  </p>
                </div>
                <button
                  onClick={() =>
                    onToast(
                      "Generated new API token: px_live_8492019482",
                      "success",
                    )
                  }
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.35)]"
                >
                  <Plus className="w-3.5 h-3.5" /> Generate Key
                </button>
              </div>

              {/* Token Table */}
              <div className="rounded-xl border border-[#201d1a] bg-[#090a0e] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-dark-card text-[10px] text-[#8a7f70] uppercase border-b border-[#201d1a]">
                    <tr>
                      <th className="p-3.5">Token Name</th>
                      <th className="p-3.5">Key Prefix</th>
                      <th className="p-3.5">Scopes</th>
                      <th className="p-3.5">Created</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181920]">
                    <tr className="hover:bg-[#12131a] transition-colors">
                      <td className="p-3.5 font-bold text-cream-100">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          CLI Production Worker
                        </div>
                      </td>
                      <td className="p-3.5 text-orange-400 font-mono">
                        px_live_8849••••••••
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20 text-[9px]">
                          workflows:write
                        </span>
                      </td>
                      <td className="p-3.5 text-[#8a7f70]">Aug 24, 2026</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() =>
                            onToast("Token copied to clipboard", "info")
                          }
                          className="text-[#d6c5a8] hover:text-white transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => onToast("Token revoked", "warning")}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                          title="Revoke"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-[#12131a] transition-colors">
                      <td className="p-3.5 font-bold text-cream-100">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          GitHub Actions PR Bot
                        </div>
                      </td>
                      <td className="p-3.5 text-orange-400 font-mono">
                        px_live_1947••••••••
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[9px]">
                          repo:read_write
                        </span>
                      </td>
                      <td className="p-3.5 text-[#8a7f70]">Aug 18, 2026</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() =>
                            onToast("Token copied to clipboard", "info")
                          }
                          className="text-[#d6c5a8] hover:text-white transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => onToast("Token revoked", "warning")}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                          title="Revoke"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>

                    <tr className="hover:bg-[#12131a] transition-colors">
                      <td className="p-3.5 font-bold text-cream-100">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#524c45]"></span>
                          Staging Sandbox Key
                        </div>
                      </td>
                      <td className="p-3.5 text-[#8a7f70] font-mono">
                        px_test_7749••••••••
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[#8a7f70] border border-slate-700 text-[9px]">
                          read:only
                        </span>
                      </td>
                      <td className="p-3.5 text-[#8a7f70]">Jul 10, 2026</td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() =>
                            onToast("Token copied to clipboard", "info")
                          }
                          className="text-[#d6c5a8] hover:text-white transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-3.5 h-3.5 inline" />
                        </button>
                        <button
                          onClick={() => onToast("Token revoked", "warning")}
                          className="text-rose-400 hover:text-rose-300 transition-colors"
                          title="Revoke"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Webhook Integration */}
              <div className="p-5 rounded-xl bg-[#090a0e] border border-[#201d1a] space-y-3">
                <h4 className="text-xs font-bold text-cream-100 uppercase tracking-wider">
                  Inbound Webhook Secret
                </h4>
                <p className="text-[10px] text-[#8a7f70]">
                  Used to sign and verify payloads arriving from GitHub/GitLab
                  webhook triggers.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    defaultValue="whsec_99482018471948291048201948"
                    readOnly
                    className="flex-1 bg-dark-base border border-[#26231f] rounded-lg p-2.5 text-cream-100 font-mono outline-none"
                  />
                  <button
                    onClick={() => onToast("Webhook secret copied", "info")}
                    className="border border-[#282420] text-[#d6c5a8] hover:border-orange-500/40 hover:text-white px-3.5 py-2.5 rounded-lg bg-dark-card transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

export { SettingsView };
