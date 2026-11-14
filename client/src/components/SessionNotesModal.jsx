import { useState, useEffect } from "react";
import { updateSessionNotes } from "../services/api";
import { Video, FileText, X, Check, Link as LinkIcon, AlertCircle } from "lucide-react";

const SessionNotesModal = ({ isOpen, onClose, swapRequest, onSuccess }) => {
  const [meetingLink, setMeetingLink] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (swapRequest) {
      setMeetingLink(swapRequest.meetingLink || "");
      setSessionNotes(swapRequest.sessionNotes || "");
      setError("");
    }
  }, [swapRequest]);

  if (!isOpen || !swapRequest) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateSessionNotes(swapRequest._id, { meetingLink, sessionNotes });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || "Could not save coordination notes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Video className="w-5 h-5 text-emerald-200" />
            <h3 className="text-lg font-bold">Session & Meeting Details</h3>
          </div>
          <p className="text-xs text-emerald-100">
            Share meeting links, discord handles, and session agenda with your swap partner.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                Meeting or Video Link
              </label>
              <input
                type="text"
                placeholder="e.g. https://meet.google.com/abc-defg-hij or Discord username"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Session Notes & Topics to Cover
              </label>
              <textarea
                rows={4}
                placeholder="Add session outline, what to prepare, agreed meeting dates, or reference docs..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 resize-none"
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200 disabled:opacity-50 transition"
              >
                <Check className="w-3.5 h-3.5" />
                {loading ? "Saving..." : "Save Details"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionNotesModal;
