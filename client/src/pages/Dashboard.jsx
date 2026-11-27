import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getIncomingRequests,
  getSentRequests,
  respondSwapRequest,
  cancelSwapRequest,
  completeSwapRequest,
} from "../services/api";
import SessionNotesModal from "../components/SessionNotesModal";
import ReviewModal from "../components/ReviewModal";
import {
  ArrowLeftRight,
  Inbox,
  Send,
  CheckCircle,
  Clock,
  Check,
  X,
  Video,
  Star,
  FileText,
  AlertCircle,
  Sparkles,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

const Dashboard = () => {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState("active"); // active, incoming, sent, completed
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const fetchAllRequests = useCallback(async () => {
    try {
      setLoading(true);
      const [incomingRes, sentRes] = await Promise.all([
        getIncomingRequests(),
        getSentRequests(),
      ]);
      setIncomingRequests(incomingRes.data || []);
      setSentRequests(sentRes.data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllRequests();
  }, [fetchAllRequests]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 5000);
  };

  const handleRespond = async (requestId, status) => {
    try {
      setActionLoading(true);
      await respondSwapRequest(requestId, status);
      showToast(status === "accepted" ? "Swap accepted! Let's arrange session details." : "Swap proposal declined.");
      await fetchAllRequests();
      refreshUser();
    } catch (err) {
      alert(err.response?.data?.msg || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm("Are you sure you want to cancel this pending swap proposal?")) return;
    try {
      setActionLoading(true);
      await cancelSwapRequest(requestId);
      showToast("Swap proposal cancelled.");
      await fetchAllRequests();
    } catch (err) {
      alert(err.response?.data?.msg || "Could not cancel request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (requestId) => {
    if (!window.confirm("Confirm that you and your partner have completed this skill swap?")) return;
    try {
      setActionLoading(true);
      await completeSwapRequest(requestId);
      showToast("Swap marked as completed! 🎉 Don't forget to review your partner.");
      await fetchAllRequests();
      refreshUser();
    } catch (err) {
      alert(err.response?.data?.msg || "Could not complete swap.");
    } finally {
      setActionLoading(false);
    }
  };

  // Groupings
  const allSwaps = [...incomingRequests, ...sentRequests];
  const activeSwaps = allSwaps.filter((s) => s.status === "accepted");
  const pendingIncoming = incomingRequests.filter((s) => s.status === "pending");
  const pendingSent = sentRequests.filter((s) => s.status === "pending");
  const completedSwaps = allSwaps.filter((s) => s.status === "completed");

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Exchange Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your active swaps, review incoming proposals, and coordinate sessions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/skills"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition"
            >
              Manage My Skills
            </Link>
            <Link
              to="/explore"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition"
            >
              + Find New Swap
            </Link>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 animate-fade-in shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Active Swaps</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{activeSwaps.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Sessions in progress</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Action Needed</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{pendingIncoming.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Incoming proposals</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Sent Proposals</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{pendingSent.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Awaiting partner response</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Reputation</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">
              {user?.ratingAverage ? user.ratingAverage.toFixed(1) : "5.0"} ★
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {user?.completedSwapsCount || completedSwaps.length} completed swaps
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="flex items-center border-b border-slate-200 overflow-x-auto scrollbar-none px-6 pt-4">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center gap-2 pb-4 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                activeTab === "active"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Active Swaps ({activeSwaps.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("incoming")}
              className={`flex items-center gap-2 pb-4 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                activeTab === "incoming"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Incoming Proposals ({pendingIncoming.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("sent")}
              className={`flex items-center gap-2 pb-4 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                activeTab === "sent"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Sent Proposals ({pendingSent.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`flex items-center gap-2 pb-4 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                activeTab === "completed"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Completed History ({completedSwaps.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-500">Loading your swaps...</p>
              </div>
            ) : (
              <>
                {/* TAB 1: ACTIVE SWAPS */}
                {activeTab === "active" && (
                  <div>
                    {activeSwaps.length === 0 ? (
                      <div className="py-12 text-center">
                        <ArrowLeftRight className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-800">No active swaps right now</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4">
                          Explore the marketplace and propose a swap to start learning!
                        </p>
                        <Link
                          to="/explore"
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                        >
                          Find a Swap Partner
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeSwaps.map((swap) => {
                          const partner =
                            swap.fromUser?._id === user?._id ? swap.toUser : swap.fromUser;
                          const iAmSender = swap.fromUser?._id === user?._id;
                          const iTeach = iAmSender ? swap.offeredSkill : swap.requestedSkill;
                          const iLearn = iAmSender ? swap.requestedSkill : swap.offeredSkill;

                          return (
                            <div
                              key={swap._id}
                              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-indigo-200 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                            >
                              <div className="flex items-start gap-4 flex-1">
                                <img
                                  src={
                                    partner?.avatar ||
                                    `https://api.dicebear.com/7.x/initials/svg?seed=${partner?.name || "User"}`
                                  }
                                  alt={partner?.name}
                                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-bold text-slate-900">{partner?.name}</h4>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                      Active Session
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                                    <span className="text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                      You teach: {iTeach}
                                    </span>
                                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                      You learn: {iLearn}
                                    </span>
                                  </div>

                                  {swap.meetingLink ? (
                                    <div className="flex items-center gap-2 text-xs text-emerald-700">
                                      <Video className="w-3.5 h-3.5" />
                                      <a
                                        href={
                                          swap.meetingLink.startsWith("http")
                                            ? swap.meetingLink
                                            : `https://${swap.meetingLink}`
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-bold underline flex items-center gap-1"
                                      >
                                        Join Meeting / Video Room <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  ) : (
                                    <p className="text-[11px] text-slate-400 italic">
                                      No meeting link added yet. Click "Session Details" to share one.
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                                <Link
                                  to={`/messages?user=${partner?._id}&swap=${swap._id}`}
                                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition flex items-center gap-1.5"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Chat with {partner?.name?.split(" ")[0]}</span>
                                </Link>

                                <button
                                  onClick={() => {
                                    setSelectedSwap(swap);
                                    setNotesModalOpen(true);
                                  }}
                                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition flex items-center gap-1.5"
                                >
                                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Session Notes</span>
                                </button>

                                <button
                                  onClick={() => handleComplete(swap._id)}
                                  disabled={actionLoading}
                                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Mark Completed</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: INCOMING PROPOSALS */}
                {activeTab === "incoming" && (
                  <div>
                    {pendingIncoming.length === 0 ? (
                      <div className="py-12 text-center">
                        <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-800">No pending proposals</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          When another member proposes a swap with you, it will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingIncoming.map((req) => (
                          <div
                            key={req._id}
                            className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-4">
                              <img
                                src={
                                  req.fromUser?.avatar ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${req.fromUser?.name || "User"}`
                                }
                                alt={req.fromUser?.name}
                                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Link
                                    to={`/profile/${req.fromUser?._id}`}
                                    className="text-sm font-bold text-slate-900 hover:underline"
                                  >
                                    {req.fromUser?.name}
                                  </Link>
                                  {req.fromUser?.ratingAverage > 0 && (
                                    <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                      <span>{req.fromUser.ratingAverage.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>

                                <p className="text-xs text-slate-700 mb-2">
                                  Wants to learn your{" "}
                                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                                    {req.requestedSkill}
                                  </span>{" "}
                                  in exchange for teaching you{" "}
                                  <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                                    {req.offeredSkill}
                                  </span>
                                </p>

                                {req.message && (
                                  <p className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200/80 italic">
                                    "{req.message}"
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                              <Link
                                to={`/messages?user=${req.fromUser?._id}&swap=${req._id}`}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition flex items-center gap-1.5"
                                title="Message before deciding"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                                <span>Message</span>
                              </Link>
                              <button
                                onClick={() => handleRespond(req._id, "declined")}
                                disabled={actionLoading}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleRespond(req._id, "accepted")}
                                disabled={actionLoading}
                                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition"
                              >
                                Accept & Swap
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: SENT PROPOSALS */}
                {activeTab === "sent" && (
                  <div>
                    {sentRequests.length === 0 ? (
                      <div className="py-12 text-center">
                        <Send className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-800">You haven't sent any proposals yet</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-4">
                          Browse the marketplace to find people to swap skills with!
                        </p>
                        <Link
                          to="/explore"
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition"
                        >
                          Explore Skills
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {sentRequests.map((req) => (
                          <div
                            key={req._id}
                            className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-4">
                              <img
                                src={
                                  req.toUser?.avatar ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${req.toUser?.name || "User"}`
                                }
                                alt={req.toUser?.name}
                                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-slate-500">Proposal sent to:</span>
                                  <Link
                                    to={`/profile/${req.toUser?._id}`}
                                    className="text-sm font-bold text-slate-900 hover:underline"
                                  >
                                    {req.toUser?.name}
                                  </Link>
                                </div>

                                <p className="text-xs text-slate-700 mb-2">
                                  Offered:{" "}
                                  <span className="font-bold text-purple-700">{req.offeredSkill}</span> ➔
                                  Requested:{" "}
                                  <span className="font-bold text-indigo-700">{req.requestedSkill}</span>
                                </p>

                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      req.status === "pending"
                                        ? "bg-amber-100 text-amber-700"
                                        : req.status === "accepted"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : req.status === "completed"
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "bg-rose-100 text-rose-700"
                                    }`}
                                  >
                                    {req.status}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                              <Link
                                to={`/messages?user=${req.toUser?._id}&swap=${req._id}`}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition flex items-center gap-1.5"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                                <span>Message</span>
                              </Link>
                              {req.status === "pending" && (
                                <button
                                  onClick={() => handleCancel(req._id)}
                                  disabled={actionLoading}
                                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition"
                                >
                                  Cancel Proposal
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: COMPLETED HISTORY */}
                {activeTab === "completed" && (
                  <div>
                    {completedSwaps.length === 0 ? (
                      <div className="py-12 text-center">
                        <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-800">No completed swaps yet</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          When you finish a swap and mark it completed, it will be catalogued here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {completedSwaps.map((swap) => {
                          const partner =
                            swap.fromUser?._id === user?._id ? swap.toUser : swap.fromUser;
                          const hasReviewed =
                            swap.fromUser?._id === user?._id
                              ? swap.hasReviewFromUser
                              : swap.hasReviewToUser;

                          return (
                            <div
                              key={swap._id}
                              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                            >
                              <div className="flex items-start gap-4">
                                <img
                                  src={
                                    partner?.avatar ||
                                    `https://api.dicebear.com/7.x/initials/svg?seed=${partner?.name || "User"}`
                                  }
                                  alt={partner?.name}
                                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-bold text-slate-900">{partner?.name}</h4>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                      Completed
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600">
                                    Swapped {swap.offeredSkill} ↔ {swap.requestedSkill}
                                  </p>
                                  <p className="text-[11px] text-slate-400 mt-1">
                                    Completed on {new Date(swap.completedAt || swap.updatedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <div>
                                {hasReviewed ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                                    <Check className="w-3.5 h-3.5" /> Reviewed
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setSelectedSwap(swap);
                                      setReviewModalOpen(true);
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm transition"
                                  >
                                    <Star className="w-3.5 h-3.5 fill-white" />
                                    <span>Leave Review</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Session Notes Modal */}
      <SessionNotesModal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        swapRequest={selectedSwap}
        onSuccess={() => {
          showToast("Session details updated successfully.");
          fetchAllRequests();
        }}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        swapRequest={selectedSwap}
        onSuccess={() => {
          showToast("Thank you! Review published successfully.");
          fetchAllRequests();
          refreshUser();
        }}
      />
    </div>
  );
};

export default Dashboard;
