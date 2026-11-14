import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createReview } from "../services/api";
import { Star, X, Check, AlertCircle } from "lucide-react";

const ReviewModal = ({ isOpen, onClose, swapRequest, onSuccess }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !swapRequest) return null;

  const partner =
    swapRequest.fromUser?._id === user?._id
      ? swapRequest.toUser
      : swapRequest.fromUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await createReview(swapRequest._id, rating, comment);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.msg || "Could not submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-5 h-5 fill-white text-white" />
            <h3 className="text-lg font-bold">Review Your Experience</h3>
          </div>
          <p className="text-xs text-amber-100">
            How was your exchange session with {partner?.name}?
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

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl mb-5">
            <img
              src={partner?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${partner?.name || "User"}`}
              alt={partner?.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
            <div>
              <p className="text-xs font-bold text-slate-800">{partner?.name}</p>
              <p className="text-[11px] text-slate-500">
                Swapped {swapRequest.offeredSkill} ↔ {swapRequest.requestedSkill}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                Select Your Rating
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-xs font-semibold text-amber-600 mt-1">
                {rating === 5 && "Outstanding Mentor / Peer"}
                {rating === 4 && "Very Good Session"}
                {rating === 3 && "Helpful Session"}
                {rating === 2 && "Could Be Better"}
                {rating === 1 && "Unsatisfactory"}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Feedback & Testimonial
              </label>
              <textarea
                rows={3}
                placeholder="Share a few words on what you learned, their teaching style, and punctuality..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-400 resize-none"
                required
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-200 disabled:opacity-50 transition"
              >
                <Check className="w-3.5 h-3.5" />
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
