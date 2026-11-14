import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCommunityUsers } from "../services/api";
import { Users, Search, Star, MapPin, Sparkles, ArrowRight } from "lucide-react";

const Community = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (query = "") => {
    try {
      setLoading(true);
      const { data } = await getCommunityUsers(query ? { q: query } : {});
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(search);
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Community Directory</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Meet Fellow Learners & Mentors</h1>
          <p className="mt-2 text-sm text-slate-600">
            Connect with peers, view their knowledge offerings, and discover mutual learning opportunities.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, skill, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>

        {/* Users Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading community members...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-sm font-bold text-slate-800">No members match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((u) => (
              <div
                key={u._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-4">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                      alt={u.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{u.name}</h3>
                        {u.ratingAverage > 0 && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 flex-shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{u.ratingAverage.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {u.headline || "Knowledge Sharer"}
                      </p>
                      {u.location && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-2.5 h-2.5" /> {u.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {u.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {u.bio}
                    </p>
                  )}

                  {/* Skills Offered */}
                  {u.skillsOffered?.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] uppercase font-bold text-indigo-700 block mb-1">
                        Teaches:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {u.skillsOffered.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Needed */}
                  {u.skillsNeeded?.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[10px] uppercase font-bold text-purple-700 block mb-1">
                        Wants to Learn:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {u.skillsNeeded.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-100"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to={`/profile/${u._id}`}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                >
                  <span>View Full Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
