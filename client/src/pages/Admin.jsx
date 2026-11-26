import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAdminMetrics,
  getAdminUsers,
  toggleAdminUserBan,
  adjustAdminUserCredits,
  toggleAdminUserRole,
  getAdminSkills,
  toggleAdminSkillFeatured,
  updateAdminSkillStatus,
  deleteAdminSkill,
  getAdminSwaps,
  resolveAdminSwap,
} from "../services/api";
import {
  Shield,
  Users,
  Sparkles,
  ArrowRightLeft,
  Coins,
  TrendingUp,
  AlertTriangle,
  Ban,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Star,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Award,
  RefreshCw,
  Clock,
  Video,
  FileText,
} from "lucide-react";

const Admin = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // State
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Search & Filter States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userBanFilter, setUserBanFilter] = useState("");

  const [skillSearch, setSkillSearch] = useState("");
  const [skillCategoryFilter, setSkillCategoryFilter] = useState("");
  const [skillStatusFilter, setSkillStatusFilter] = useState("");

  const [swapStatusFilter, setSwapStatusFilter] = useState("");

  // Modals state
  const [creditModalUser, setCreditModalUser] = useState(null);
  const [creditAmount, setCreditAmount] = useState(1);
  const [creditReason, setCreditReason] = useState("");

  const [banModalUser, setBanModalUser] = useState(null);
  const [banReason, setBanReason] = useState("");

  const [disputeSwap, setDisputeSwap] = useState(null);
  const [disputeResolution, setDisputeResolution] = useState("force_complete");
  const [disputeNotes, setDisputeNotes] = useState("");

  const showFeedback = (msg, isError = false) => {
    setFeedback({ msg, isError });
    setTimeout(() => setFeedback(null), 4000);
  };

  // 1. Fetch Metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const { data } = await getAdminMetrics();
      setMetrics(data);
    } catch (err) {
      showFeedback(err.response?.data?.msg || "Failed to load metrics", true);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await getAdminUsers({
        q: userSearch,
        role: userRoleFilter,
        isBanned: userBanFilter,
      });
      setUsers(data);
    } catch (err) {
      showFeedback(err.response?.data?.msg || "Failed to load users", true);
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Skills
  const fetchSkills = async () => {
    try {
      setLoading(true);
      const { data } = await getAdminSkills({
        q: skillSearch,
        category: skillCategoryFilter,
        status: skillStatusFilter,
      });
      setSkills(data);
    } catch (err) {
      showFeedback(err.response?.data?.msg || "Failed to load skills", true);
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch Swaps
  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const { data } = await getAdminSwaps({
        status: swapStatusFilter,
      });
      setSwaps(data);
    } catch (err) {
      showFeedback(err.response?.data?.msg || "Failed to load swaps", true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview") fetchMetrics();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "skills") fetchSkills();
    if (activeTab === "swaps") fetchSwaps();
  }, [activeTab]);

  // Handlers for Users
  const handleToggleBan = async () => {
    if (!banModalUser) return;
    try {
      setActionLoading(true);
      const { data } = await toggleAdminUserBan(banModalUser._id, banReason);
      showFeedback(data.msg);
      setBanModalUser(null);
      setBanReason("");
      fetchUsers();
    } catch (err) {
      showFeedback(err.response?.data?.msg || "Action failed", true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdjustCredits = async () => {
    if (!creditModalUser) return;
    try {
      setActionLoading(true);
      const { data } = await adjustAdminUserCredits(creditModalUser._id, creditAmount, creditReason);
      showFeedback(data.msg);
      setCreditModalUser(null);
      setCreditAmount(1);
      setCreditReason("");
      fetchUsers();
    } catch (err) {
      showFeedback(err.response?.data?.msg || "Credit adjustment failed", true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    if (!window.confirm(`Are you sure you want to change ${targetUser.name}'s role to ${newRole}?`)) {
      return;
    }
    try {
      setActionLoading(true);
      const { data } = await toggleAdminUserRole(targetUser._id, newRole);
      showFeedback(data.msg);
      fetchUsers();
    } catch (err) {
      showFeedback(err.response?.data?.msg || "Role update failed", true);
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for Skills
  const handleToggleFeatured = async (skillId) => {
    try {
      const { data } = await toggleAdminSkillFeatured(skillId);
      showFeedback(data.msg);
      fetchSkills();
    } catch (err) {
      showFeedback(err.response?.data?.msg || "Action failed", true);
    }
  };

  const handleUpdateSkillStatus = async (skillId, status) => {
    try {
      const { data } = await updateAdminSkillStatus(skillId, status);
      showFeedback(data.msg);
      fetchSkills();
    } catch (err) {
      showFeedback(err.response?.data?.msg || "Action failed", true);
    }
  };

  const handleDeleteSkill = async (skillId, title) => {
    if (!window.confirm(`Permanently delete skill "${title}"? This cannot be undone.`)) return;
    try {
      const { data } = await deleteAdminSkill(skillId);
      showFeedback(data.msg);
      fetchSkills();
    } catch (err) {
      showFeedback(err.response?.data?.msg || "Delete failed", true);
    }
  };

  // Handlers for Swaps
  const handleResolveSwap = async () => {
    if (!disputeSwap) return;
    try {
      setActionLoading(true);
      const { data } = await resolveAdminSwap(disputeSwap._id, disputeResolution, disputeNotes);
      showFeedback(data.msg);
      setDisputeSwap(null);
      setDisputeNotes("");
      fetchSwaps();
    } catch (err) {
      showFeedback(err.response?.data?.msg || "Resolution failed", true);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-950">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Admin Command Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Superadmin
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Oversight, user trust & safety, liquidity economics, and marketplace moderation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeTab === "overview") fetchMetrics();
                if (activeTab === "users") fetchUsers();
                if (activeTab === "skills") fetchSkills();
                if (activeTab === "swaps") fetchSwaps();
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedback && (
          <div
            className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2.5 animate-fade-in ${
              feedback.isError
                ? "bg-rose-950/60 border-rose-800 text-rose-300"
                : "bg-emerald-950/60 border-emerald-800 text-emerald-300"
            }`}
          >
            {feedback.isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: "overview", label: "Overview & KPIs", icon: TrendingUp },
            { id: "users", label: "User Management", icon: Users },
            { id: "skills", label: "Skill Moderation", icon: Sparkles },
            { id: "swaps", label: "Swap Oversight & Disputes", icon: ArrowRightLeft },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: OVERVIEW & KPIS ================= */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {metrics?.overview && (
              <>
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Users */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
                      <Users className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{metrics.overview.totalUsers}</span>
                      <span className="text-xs text-emerald-400 font-semibold">{metrics.overview.activeUsers} Active</span>
                    </div>
                    {metrics.overview.bannedUsers > 0 && (
                      <p className="text-[11px] text-rose-400 mt-1 font-medium">{metrics.overview.bannedUsers} suspended</p>
                    )}
                  </div>

                  {/* Card 2: Skills */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Listed Skills</span>
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{metrics.overview.totalSkills}</span>
                      <span className="text-xs text-purple-400 font-semibold">{metrics.overview.featuredSkills} Featured</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Across 8 categories</p>
                  </div>

                  {/* Card 3: Swaps */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Swaps</span>
                      <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">{metrics.overview.totalSwaps}</span>
                      <span className="text-xs text-emerald-400 font-semibold">{metrics.overview.completionRatePct}% Completed</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{metrics.overview.completedSwaps} successful sessions</p>
                  </div>

                  {/* Card 4: Economy */}
                  <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SkillCoins Circulating</span>
                      <Coins className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-amber-400">🪙 {metrics.overview.circulatingCredits}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Platform Rating: {metrics.overview.averageRating} ★</p>
                  </div>
                </div>

                {/* Middle Grid: Category Breakdown + Swap Pipeline */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category Breakdown */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Marketplace Category Distribution</span>
                    </h3>
                    <div className="space-y-3">
                      {metrics.categoryDistribution?.map((cat) => {
                        const pct = metrics.overview.totalSkills > 0
                          ? Math.round((cat.count / metrics.overview.totalSkills) * 100)
                          : 0;
                        return (
                          <div key={cat.category} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-medium">
                              <span className="text-slate-300">{cat.category}</span>
                              <span className="text-slate-400">{cat.count} skills ({pct}%)</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Swap Pipeline / Funnel */}
                  <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                      <span>Swap Lifecycle Pipeline</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                        <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Pending Proposals</span>
                        <div className="text-2xl font-black text-white mt-1">{metrics.overview.pendingSwaps}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Awaiting mentor reply</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                        <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Active Swaps</span>
                        <div className="text-2xl font-black text-white mt-1">{metrics.overview.acceptedSwaps}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Sessions in progress</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Completed</span>
                        <div className="text-2xl font-black text-white mt-1">{metrics.overview.completedSwaps}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Verified completions</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
                        <span className="text-xs text-rose-400 font-bold uppercase tracking-wider">Declined / Stalled</span>
                        <div className="text-2xl font-black text-white mt-1">{metrics.overview.declinedSwaps}</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Zero credit impact</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Platform Swaps Feed */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>Real-Time Marketplace Feed</span>
                  </h3>
                  <div className="divide-y divide-slate-700/60">
                    {metrics.recentSwaps?.map((s) => (
                      <div key={s._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.fromUser?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=User"}
                            alt={s.fromUser?.name}
                            className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                          />
                          <div>
                            <span className="font-bold text-white">{s.fromUser?.name}</span>
                            <span className="text-slate-400"> proposed to </span>
                            <span className="font-bold text-white">{s.toUser?.name}</span>
                            <p className="text-slate-400 text-[11px]">
                              {s.exchangeType === "credit_exchange" ? "🪙 1 Credit Swap" : `Offered: ${s.offeredSkill?.title}`} ➔ Wanted: {s.requestedSkill?.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              s.status === "completed"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : s.status === "accepted"
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : s.status === "pending"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {s.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= TAB 2: USER MANAGEMENT ================= */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => {
                  setUserRoleFilter(e.target.value);
                  setTimeout(fetchUsers, 0);
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Roles</option>
                <option value="user">Standard Users</option>
                <option value="admin">Administrators</option>
              </select>

              <select
                value={userBanFilter}
                onChange={(e) => {
                  setUserBanFilter(e.target.value);
                  setTimeout(fetchUsers, 0);
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="false">Active Only</option>
                <option value="true">Suspended Only</option>
              </select>

              <button
                onClick={fetchUsers}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition"
              >
                Filter
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Credits</th>
                      <th className="py-3.5 px-4">Swaps</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-700/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=User"}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u._id === currentUser?._id && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">You</span>
                                )}
                              </div>
                              <div className="text-slate-400 text-xs">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              u.role === "admin"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-400">🪙 {u.credits}</td>
                        <td className="py-3.5 px-4 text-slate-300">{u.completedSwapsCount}</td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {u.ratingAverage ? `${u.ratingAverage} ★ (${u.ratingCount || 0})` : "N/A"}
                        </td>
                        <td className="py-3.5 px-4">
                          {u.isBanned ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Suspended
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Adjust Credits */}
                            <button
                              onClick={() => setCreditModalUser(u)}
                              title="Adjust Credits"
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition text-xs font-bold"
                            >
                              🪙 Credits
                            </button>

                            {/* Toggle Admin */}
                            {u._id !== currentUser?._id && (
                              <button
                                onClick={() => handleToggleRole(u)}
                                title={u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition text-xs font-bold"
                              >
                                {u.role === "admin" ? "Demote" : "Make Admin"}
                              </button>
                            )}

                            {/* Ban / Unban */}
                            {u._id !== currentUser?._id && (
                              <button
                                onClick={() => {
                                  if (u.isBanned) {
                                    setBanModalUser(u);
                                  } else {
                                    setBanModalUser(u);
                                  }
                                }}
                                title={u.isBanned ? "Lift Suspension" : "Suspend Account"}
                                className={`p-1.5 rounded-lg text-xs font-bold border transition ${
                                  u.isBanned
                                    ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                    : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                                }`}
                              >
                                {u.isBanned ? "Unban" : "Suspend"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-500">
                          No users matched your search filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: SKILL MODERATION ================= */}
        {activeTab === "skills" && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search skills by title or description..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchSkills()}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>

              <select
                value={skillCategoryFilter}
                onChange={(e) => {
                  setSkillCategoryFilter(e.target.value);
                  setTimeout(fetchSkills, 0);
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                <option value="Development & IT">Development & IT</option>
                <option value="Design & Creative">Design & Creative</option>
                <option value="Languages">Languages</option>
                <option value="Marketing & Business">Marketing & Business</option>
                <option value="Music & Audio">Music & Audio</option>
                <option value="Academics">Academics</option>
              </select>

              <select
                value={skillStatusFilter}
                onChange={(e) => {
                  setSkillStatusFilter(e.target.value);
                  setTimeout(fetchSkills, 0);
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="flagged">Flagged</option>
                <option value="archived">Archived</option>
              </select>

              <button
                onClick={fetchSkills}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition"
              >
                Filter
              </button>
            </div>

            {/* Skills Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4">Skill Title</th>
                      <th className="py-3.5 px-4">Mentor</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Level</th>
                      <th className="py-3.5 px-4">Featured</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {skills.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-700/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{s.title}</div>
                          <div className="text-slate-400 text-xs line-clamp-1 max-w-xs">{s.description}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">{s.userId?.name || "Deleted User"}</div>
                          <div className="text-slate-400 text-[11px]">{s.userId?.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{s.category}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300">
                            {s.level}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleFeatured(s._id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold border transition ${
                              s.isFeatured
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-slate-700/50 text-slate-400 border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${s.isFeatured ? "fill-amber-400 text-amber-400" : ""}`} />
                            <span>{s.isFeatured ? "Featured" : "Standard"}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              s.status === "flagged"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : s.status === "archived"
                                ? "bg-slate-700 text-slate-400"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {s.status || "active"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {s.status === "flagged" ? (
                              <button
                                onClick={() => handleUpdateSkillStatus(s._id, "active")}
                                className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold"
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateSkillStatus(s._id, "flagged")}
                                className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold"
                              >
                                Flag
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSkill(s._id, s.title)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold"
                              title="Delete Skill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {skills.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-500">
                          No skills found matching the search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SWAPS & DISPUTES ================= */}
        {activeTab === "swaps" && (
          <div className="space-y-6 animate-fade-in">
            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {["", "pending", "accepted", "completed", "cancelled", "declined"].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setSwapStatusFilter(st);
                      setTimeout(fetchSwaps, 0);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                      swapStatusFilter === st
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {st === "" ? "All Swaps" : st}
                  </button>
                ))}
              </div>
              <button
                onClick={fetchSwaps}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Refresh
              </button>
            </div>

            {/* Swaps Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                  <thead className="bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-700">
                    <tr>
                      <th className="py-3.5 px-4">Participants</th>
                      <th className="py-3.5 px-4">Exchange Type</th>
                      <th className="py-3.5 px-4">Offered / Requested</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Meeting / Session Notes</th>
                      <th className="py-3.5 px-4 text-right">Oversight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {swaps.map((sw) => (
                      <tr key={sw._id} className="hover:bg-slate-700/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{sw.fromUser?.name || "Deleted"}</div>
                          <div className="text-[11px] text-slate-400">to {sw.toUser?.name || "Deleted"}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              sw.exchangeType === "credit_exchange"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            }`}
                          >
                            {sw.exchangeType === "credit_exchange" ? "🪙 1 Credit" : "Direct Barter"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-semibold text-slate-200">
                            {sw.offeredSkill?.title || "No skill (Credit)"} ➔ {sw.requestedSkill?.title || "N/A"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              sw.status === "completed"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : sw.status === "accepted"
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : sw.status === "pending"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {sw.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          {sw.meetingLink && (
                            <a
                              href={sw.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 hover:underline flex items-center gap-1 text-xs truncate mb-1"
                            >
                              <Video className="w-3 h-3" />
                              <span className="truncate">{sw.meetingLink}</span>
                            </a>
                          )}
                          {sw.sessionNotes && (
                            <div className="text-[11px] text-slate-400 line-clamp-2">
                              {sw.sessionNotes}
                            </div>
                          )}
                          {!sw.meetingLink && !sw.sessionNotes && (
                            <span className="text-slate-500 text-xs">No notes added</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {sw.status === "accepted" ? (
                            <button
                              onClick={() => setDisputeSwap(sw)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
                            >
                              Resolve Dispute
                            </button>
                          ) : (
                            <button
                              onClick={() => setDisputeSwap(sw)}
                              className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition"
                            >
                              Override
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {swaps.length === 0 && (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-500">
                          No swaps in this state.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: ADJUST CREDITS ================= */}
        {creditModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span>Adjust Credits: {creditModalUser.name}</span>
                </h3>
                <button
                  onClick={() => setCreditModalUser(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Current balance: <span className="font-bold text-amber-400 text-sm">🪙 {creditModalUser.credits} Credits</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Credit Change Amount (e.g. +3 to grant, -2 to deduct)
                </label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  placeholder="e.g. Promotional bonus, dispute compensation..."
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setCreditModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjustCredits}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Save Adjustment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: SUSPEND / BAN USER ================= */}
        {banModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Ban className="w-5 h-5 text-rose-400" />
                  <span>{banModalUser.isBanned ? "Lift Suspension" : "Suspend User Account"}</span>
                </h3>
                <button
                  onClick={() => setBanModalUser(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {banModalUser.isBanned
                  ? `Are you sure you want to restore full platform access for ${banModalUser.name}?`
                  : `Suspending ${banModalUser.name} will immediately revoke their access to login and participate in knowledge exchanges.`}
              </p>

              {!banModalUser.isBanned && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Reason for Suspension (Visible to User)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="e.g. Terms of Service violation, repeated session no-shows..."
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-rose-500 placeholder-slate-500"
                  ></textarea>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setBanModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleBan}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition disabled:opacity-50 ${
                    banModalUser.isBanned
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {actionLoading
                    ? "Processing..."
                    : banModalUser.isBanned
                    ? "Confirm Unban"
                    : "Confirm Suspension"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: DISPUTE RESOLUTION ================= */}
        {disputeSwap && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-400" />
                  <span>Administrative Swap Override</span>
                </h3>
                <button
                  onClick={() => setDisputeSwap(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs space-y-1">
                <div>
                  <span className="text-slate-400">Requester:</span>{" "}
                  <span className="font-bold text-white">{disputeSwap.fromUser?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400">Recipient Mentor:</span>{" "}
                  <span className="font-bold text-white">{disputeSwap.toUser?.name}</span>
                </div>
                <div>
                  <span className="text-slate-400">Exchange Type:</span>{" "}
                  <span className="font-bold text-amber-300">{disputeSwap.exchangeType}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Resolution Decision
                </label>
                <select
                  value={disputeResolution}
                  onChange={(e) => setDisputeResolution(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="force_complete">Force Complete (Award credit to mentor, mark swap complete)</option>
                  <option value="force_cancel">Force Cancel (Refund credit to requester, mark swap cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Resolution Notes (Logged to Swap Audit Trail)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Session verified via recording; requester confirmed attendance..."
                  value={disputeNotes}
                  onChange={(e) => setDisputeNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDisputeSwap(null)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveSwap}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {actionLoading ? "Executing..." : "Apply Resolution"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
