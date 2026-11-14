import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserSkills, sendSwapRequest } from "../services/api";
import { X, Send, ArrowRightLeft, AlertCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const SwapModal = ({ isOpen, onClose, targetUser, targetSkillTitle, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [mySkills, setMySkills] = useState([]);
  const [offeredSkill, setOfferedSkill] = useState("");
  const [customOffered, setCustomOffered] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && isAuthenticated && user?._id) {
      setError("");
      setMessage("");
      getUserSkills(user._id)
        .then(({ data }) => {
          setMySkills(data);
          if (data.length > 0) {
            setOfferedSkill(data[0].title);
          } else if (user.skillsOffered?.length > 0) {
            setOfferedSkill(user.skillsOffered[0]);
          } else {
            setOfferedSkill("custom");
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen, isAuthenticated, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const skillToOffer = offeredSkill === "custom" ? customOffered.trim() : offeredSkill;
    if (!skillToOffer) {
      setError("Please specify the skill you want to offer in exchange.");
      return;
    }

    try {
      setLoading(true);
      const isCreditExchange = skillToOffer.includes("Credit");
      await sendSwapRequest(
        targetUser._id,
        skillToOffer,
        targetSkillTitle,
        message,
        isCreditExchange ? "credit_exchange" : "direct_barter"
      );
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || "Could not submit swap proposal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <ArrowRightLeft className="w-5 h-5 text-indigo-200" />
            <h3 className="text-lg font-bold">Propose a Skill Swap</h3>
          </div>
          <p className="text-xs text-indigo-100">
            Send an exchange proposal to barter your knowledge with {targetUser?.name}.
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Swap Preview Pill */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-5 flex items-center justify-between gap-3 text-xs">
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">You Learn</span>
              <span className="font-bold text-indigo-700 text-sm">{targetSkillTitle}</span>
              <span className="text-slate-500 block text-[11px]">from {targetUser?.name}</span>
            </div>
            <ArrowRightLeft className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex-1 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">You Teach</span>
              <span className="font-bold text-purple-700 text-sm">
                {offeredSkill === "custom" ? customOffered || "Your Skill" : offeredSkill || "Select..."}
              </span>
              <span className="text-slate-500 block text-[11px]">in exchange</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                What skill will you teach {targetUser?.name}?
              </label>

              {mySkills.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={offeredSkill}
                    onChange={(e) => setOfferedSkill(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="🪙 1 Skill Credit">
                      🪙 Spend 1 Skill Credit (Balance: {user?.credits ?? 3} credits)
                    </option>
                    {mySkills.map((s) => (
                      <option key={s._id} value={s.title}>
                        Teach: {s.title} ({s.level || "Intermediate"})
                      </option>
                    ))}
                    <option value="custom">+ Offer a custom skill...</option>
                  </select>

                  {offeredSkill === "custom" && (
                    <input
                      type="text"
                      placeholder="e.g. French Pronunciation, Python Automation..."
                      value={customOffered}
                      onChange={(e) => setCustomOffered(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="e.g. JavaScript, Acoustic Guitar, Graphic Design..."
                    value={customOffered}
                    onChange={(e) => {
                      setCustomOffered(e.target.value);
                      setOfferedSkill("custom");
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>Tip: You can also manage your permanent skills in the</span>
                    <Link to="/skills" className="text-indigo-600 underline font-semibold">
                      Skills Manager
                    </Link>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Proposal Note & Availability (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Hi! I saw your skill listing and would love to exchange knowledge. I'm available weekday evenings or Sunday mornings. Let's connect!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400 resize-none"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-50 transition"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? "Sending..." : "Send Proposal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SwapModal;
