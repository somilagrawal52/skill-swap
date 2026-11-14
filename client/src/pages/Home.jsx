import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllSkills } from "../services/api";
import {
  ArrowRight,
  Sparkles,
  Code2,
  Palette,
  Languages,
  TrendingUp,
  Music,
  GraduationCap,
  Activity,
  ArrowRightLeft,
  Star,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredSkills, setFeaturedSkills] = useState([]);

  useEffect(() => {
    getAllSkills()
      .then(({ data }) => setFeaturedSkills(data.slice(0, 6)))
      .catch((err) => console.error(err));
  }, []);

  const categories = [
    { name: "Development & IT", icon: Code2, color: "from-blue-500 to-indigo-600", count: "12+ Skills" },
    { name: "Design & Creative", icon: Palette, color: "from-pink-500 to-rose-600", count: "8+ Skills" },
    { name: "Languages", icon: Languages, color: "from-emerald-500 to-teal-600", count: "10+ Skills" },
    { name: "Marketing & Business", icon: TrendingUp, color: "from-amber-500 to-orange-600", count: "6+ Skills" },
    { name: "Music & Audio", icon: Music, color: "from-purple-500 to-indigo-600", count: "5+ Skills" },
    { name: "Academics", icon: GraduationCap, color: "from-cyan-500 to-blue-600", count: "7+ Skills" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50">
        <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Zero Money. 100% Reciprocal Knowledge Exchange.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Teach what you know. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Learn what you love.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Trade your expertise directly with peers around the world. Teach web development to learn Spanish, or swap Figma design for acoustic guitar lessons.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-200 transition-all hover:-translate-y-0.5"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!isAuthenticated ? (
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm transition-all hover:-translate-y-0.5"
              >
                <span>Join Community Free</span>
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm transition-all"
              >
                <span>Go to Dashboard</span>
              </Link>
            )}
          </div>

          {/* Social Proof Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto border-t border-slate-200/80 pt-8">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">500+</p>
              <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Active Mentors</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-purple-600">1,200+</p>
              <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Swaps Completed</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">4.9 ★</p>
              <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Community Rating</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-pink-600">$0</p>
              <p className="text-xs font-semibold text-slate-500 uppercase mt-0.5">Always Free</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Simple 3-Step Process</h2>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">How Skill Barter Works</h3>
            <p className="mt-3 text-sm text-slate-600">
              No money, no subscriptions. Just bilateral exchange of talent and knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-md shadow-indigo-100">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">List What You Can Teach</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add skills you are confident teaching (coding, languages, design, music) along with what you want to learn in return.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-md shadow-purple-100">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Get Smart Match Suggestions</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our Barter Engine instantly pairs you with members who teach what you want and seek what you teach. Propose a swap in one click.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-md shadow-emerald-100">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Exchange, Learn & Review</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Meet on Google Meet or Discord, exchange 1:1 sessions, mark the swap as completed, and leave mutual feedback to grow reputation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Explore Domains</h2>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">Popular Learning Categories</h3>
            </div>
            <Link
              to="/explore"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Browse all categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  to={`/explore?category=${encodeURIComponent(cat.name)}`}
                  className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 transition-all flex flex-col items-center text-center"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {cat.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 mt-1">{cat.count}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Skills Preview */}
      {featuredSkills.length > 0 && (
        <section className="py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Live Listings</h2>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Featured Skills Ready to Barter</h3>
              </div>
              <Link
                to="/explore"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View all skills <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSkills.map((skill) => (
                <div
                  key={skill._id}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {skill.category}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {skill.level}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mb-2">{skill.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      {skill.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={skill.userId?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${skill.userId?.name || "U"}`}
                        alt={skill.userId?.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                          {skill.userId?.name}
                        </p>
                        {skill.userId?.ratingAverage > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{skill.userId.ratingAverage.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link
                      to="/explore"
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
                    >
                      Swap
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-tr from-indigo-900 via-indigo-800 to-purple-900 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6">
            Ready to swap knowledge with the world?
          </h2>
          <p className="text-sm sm:text-base text-indigo-200 max-w-xl mx-auto mb-8 leading-relaxed">
            Join thousands of passionate developers, designers, polyglots, and creators learning together without tuition or subscription fees.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-indigo-900 font-bold text-sm shadow-xl hover:bg-indigo-50 transition"
            >
              Create Free Account
            </Link>
            <Link
              to="/explore"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-bold text-sm border border-indigo-500/30 transition"
            >
              Browse Skills First
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
