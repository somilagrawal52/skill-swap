import { useState, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllSkills, getSmartMatches } from "../services/api";
import SwapModal from "../components/SwapModal";
import {
  Search,
  Filter,
  Sparkles,
  Star,
  MapPin,
  ArrowRightLeft,
  X,
  Compass,
  CheckCircle2,
  Tag,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Development & IT",
  "Design & Creative",
  "Languages",
  "Marketing & Business",
  "Music & Audio",
  "Academics",
  "Fitness & Health",
  "Lifestyle & Other",
];

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced", "Expert"];

const Explore = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Search and filter state
  const queryParams = new URLSearchParams(location.search);
  const initialCategory = queryParams.get("category") || "All";

  const [skills, setSkills] = useState([]);
  const [smartMatches, setSmartMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState("All");

  // Swap modal state
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedTargetUser, setSelectedTargetUser] = useState(null);
  const [selectedTargetSkill, setSelectedTargetSkill] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.q = search.trim();
      if (selectedCategory !== "All") params.category = selectedCategory;
      if (selectedLevel !== "All") params.level = selectedLevel;

      const { data } = await getAllSkills(params);
      setSkills(data);
    } catch (err) {
      console.error("Error fetching skills:", err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedLevel]);

  const fetchMatches = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await getSmartMatches();
      setSmartMatches(data);
    } catch (err) {
      console.error("Error fetching smart matches:", err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleProposeSwap = (targetUser, skillTitle) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setSelectedTargetUser(targetUser);
    setSelectedTargetSkill(skillTitle);
    setSwapModalOpen(true);
  };

  const handleSwapSuccess = () => {
    setSuccessToast("Swap proposal submitted successfully! Track it on your dashboard.");
    setTimeout(() => setSuccessToast(""), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Exchange Marketplace</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Explore Skills to Learn</h1>
          <p className="mt-2 text-sm text-slate-600">
            Find mentors and peers across disciplines ready to trade their knowledge with you.
          </p>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 animate-fade-in shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{successToast}</span>
            </div>
            <Link to="/dashboard" className="font-bold underline text-emerald-700">
              Go to Dashboard →
            </Link>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by skill name, keywords (e.g. React, Python, Guitar, Figma)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Level Filter Dropdown */}
            <div className="sm:w-48">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level: {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Smart Matches Section (if logged in & matches exist) */}
        {isAuthenticated && smartMatches.length > 0 && (
          <div className="mb-10 p-6 rounded-3xl bg-gradient-to-tr from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
              <h2 className="text-lg font-bold">Smart Barter Matches for You</h2>
            </div>
            <p className="text-xs text-indigo-200 mb-6">
              Based on the skills you offer and want to learn, here are members who match your goals:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {smartMatches.slice(0, 3).map((match) => (
                <div
                  key={match.user._id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                        {match.matchType === "mutual" ? "★ Perfect Barter Match" : "Complementary Peer"}
                      </span>
                      {match.user.ratingAverage > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                          <Star className="w-3 h-3 fill-amber-300" />
                          <span>{match.user.ratingAverage.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 mb-3">
                      <img
                        src={match.user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${match.user.name}`}
                        alt={match.user.name}
                        className="w-9 h-9 rounded-full object-cover border border-white/20"
                      />
                      <div>
                        <Link
                          to={`/profile/${match.user._id}`}
                          className="text-xs font-bold text-white hover:underline truncate block"
                        >
                          {match.user.name}
                        </Link>
                        <p className="text-[10px] text-indigo-200 truncate">{match.user.headline || match.user.location}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] mb-4">
                      {match.theyCanTeachMe?.length > 0 && (
                        <p className="text-emerald-300">
                          <span className="font-bold">They can teach you:</span> {match.theyCanTeachMe.join(", ")}
                        </p>
                      )}
                      {match.iCanTeachThem?.length > 0 && (
                        <p className="text-indigo-200">
                          <span className="font-bold">They want to learn:</span> {match.iCanTeachThem.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleProposeSwap(
                        match.user,
                        match.theyCanTeachMe?.[0] || match.user.skillsOffered?.[0] || "Knowledge Swap"
                      )
                    }
                    className="w-full py-2 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-indigo-50 transition shadow-sm text-center"
                  >
                    Propose Swap with {match.user.name.split(" ")[0]}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Skills Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700">
              Showing {skills.length} available {skills.length === 1 ? "skill" : "skills"}
            </h2>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-500">Loading marketplace skills...</p>
            </div>
          ) : skills.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <p className="text-sm font-bold text-slate-800">No skills match your filters.</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Try searching for a different keyword or resetting your category filter.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setSelectedLevel("All");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => {
                const isOwnSkill = user?._id === skill.userId?._id;

                return (
                  <div
                    key={skill._id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-50/50 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Category & Level Badges */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {skill.category}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                          {skill.level}
                        </span>
                      </div>

                      {/* Skill Title & Description */}
                      <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                        {skill.title}
                      </h3>
                      <p className="text-xs text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                        {skill.description || "No description provided for this skill."}
                      </p>

                      {/* Tags */}
                      {skill.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {skill.tags.map((t) => (
                            <span
                              key={t}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Teacher Footer */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <Link
                          to={`/profile/${skill.userId?._id}`}
                          className="flex items-center gap-2.5 group"
                        >
                          <img
                            src={
                              skill.userId?.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${skill.userId?.name || "User"}`
                            }
                            alt={skill.userId?.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-indigo-400 transition"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate max-w-[130px]">
                              {skill.userId?.name}
                            </p>
                            {skill.userId?.location && (
                              <p className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5" /> {skill.userId.location}
                              </p>
                            )}
                          </div>
                        </Link>

                        {skill.userId?.ratingAverage > 0 && (
                          <div className="flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{skill.userId.ratingAverage.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* What they want in return */}
                      {skill.userId?.skillsNeeded?.length > 0 && (
                        <div className="mb-4 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600">
                          <span className="font-bold text-slate-700 block text-[10px] uppercase">
                            Looking to learn:
                          </span>
                          <span className="text-purple-700 font-semibold truncate block">
                            {skill.userId.skillsNeeded.slice(0, 2).join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Action Button */}
                      {isOwnSkill ? (
                        <Link
                          to="/skills"
                          className="w-full block py-2 rounded-xl text-xs font-bold text-center text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition"
                        >
                          Edit Your Skill
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleProposeSwap(skill.userId, skill.title)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Propose Swap</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Swap Proposal Modal */}
      <SwapModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        targetUser={selectedTargetUser}
        targetSkillTitle={selectedTargetSkill}
        onSuccess={handleSwapSuccess}
      />
    </div>
  );
};

export default Explore;
