import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getUserProfile,
  updateMyProfile,
} from "../services/api";
import SwapModal from "../components/SwapModal";
import {
  User,
  Star,
  MapPin,
  Clock,
  Mail,
  Github,
  Linkedin,
  Calendar,
  CheckCircle2,
  Sparkles,
  Edit3,
  ArrowRightLeft,
  MessageSquare,
  BookOpen,
  GraduationCap,
  X,
  Check,
} from "lucide-react";

const Profile = () => {
  const { id } = useParams(); // If present, viewing other user; if not, viewing self
  const { user: currentUser, updateUser, refreshUser } = useAuth();

  const isOwnProfile = !id || id === currentUser?._id;
  const targetId = isOwnProfile ? currentUser?._id : id;

  const [profileData, setProfileData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("");
  const [discord, setDiscord] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [calendly, setCalendly] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // Swap modal state
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedSkillTitle, setSelectedSkillTitle] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!targetId) return;
    try {
      setLoading(true);
      const { data } = await getUserProfile(targetId);
      setProfileData(data.user);
      setSkills(data.skills || []);
      setReviews(data.reviews || []);

      // Populate edit fields if own profile
      if (isOwnProfile && data.user) {
        setName(data.user.name || "");
        setHeadline(data.user.headline || "");
        setBio(data.user.bio || "");
        setAvatar(data.user.avatar || "");
        setLocation(data.user.location || "");
        setTimezone(data.user.timezone || "");
        setDiscord(data.user.contactInfo?.discord || "");
        setLinkedin(data.user.contactInfo?.linkedin || "");
        setGithub(data.user.contactInfo?.github || "");
        setCalendly(data.user.contactInfo?.calendly || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [targetId, isOwnProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      const updated = {
        name,
        headline,
        bio,
        avatar,
        location,
        timezone,
        contactInfo: { discord, linkedin, github, calendly },
      };
      const { data } = await updateMyProfile(updated);
      updateUser(data);
      setProfileData(data);
      setIsEditing(false);
      refreshUser();
    } catch (err) {
      alert(err.response?.data?.msg || "Could not save profile updates.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">User profile not found</h2>
        <Link to="/explore" className="text-sm font-semibold text-indigo-600 mt-2 inline-block">
          Return to Marketplace →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative"></div>

          <div className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 gap-4 mb-6">
              <div className="flex items-end gap-4">
                <img
                  src={
                    profileData.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name}`
                  }
                  alt={profileData.name}
                  className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-md bg-white flex-shrink-0"
                />
                <div className="pb-1">
                  <h1 className="text-2xl font-black text-slate-900 leading-tight">
                    {profileData.name}
                  </h1>
                  <p className="text-xs font-semibold text-slate-500">
                    {profileData.headline || "Knowledge Enthusiast & Skill Exchanger"}
                  </p>
                </div>
              </div>

              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5 self-start sm:self-end"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? "Close Editor" : "Edit Profile"}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedSkillTitle(skills[0]?.title || "Skill Exchange");
                    setSwapModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition flex items-center gap-2 self-start sm:self-end"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Propose Swap</span>
                </button>
              )}
            </div>

            {/* Quick Stats & Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 py-3 border-y border-slate-100 mb-6">
              {profileData.ratingAverage > 0 && (
                <div className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{profileData.ratingAverage.toFixed(1)} rating</span>
                  <span className="text-slate-400 font-normal">({profileData.ratingCount} reviews)</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{profileData.completedSwapsCount || 0} completed swaps</span>
              </div>

              {profileData.location && (
                <div className="flex items-center gap-1 text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profileData.location}</span>
                </div>
              )}

              {profileData.timezone && (
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profileData.timezone}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {profileData.bio && (
              <p className="text-xs text-slate-700 leading-relaxed max-w-3xl mb-6">
                {profileData.bio}
              </p>
            )}

            {/* Contact channels */}
            <div className="flex flex-wrap items-center gap-3">
              {profileData.contactInfo?.discord && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                  <span>Discord: {profileData.contactInfo.discord}</span>
                </span>
              )}
              {profileData.contactInfo?.github && (
                <a
                  href={`https://${profileData.contactInfo.github.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  <Github className="w-3.5 h-3.5" /> GitHub
                </a>
              )}
              {profileData.contactInfo?.linkedin && (
                <a
                  href={`https://${profileData.contactInfo.linkedin.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
              {profileData.contactInfo?.calendly && (
                <a
                  href={`https://${profileData.contactInfo.calendly.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  <Calendar className="w-3.5 h-3.5" /> Schedule
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Form (if active) */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="bg-white p-6 rounded-3xl border border-indigo-200 shadow-md space-y-4 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Edit Your Public Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Dev & UI Designer"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bio / About You</label>
              <textarea
                rows={3}
                placeholder="Share your background, passions, and exchange interests..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Austin, Texas"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Timezone</label>
                <input
                  type="text"
                  placeholder="e.g. EST (UTC-5)"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Discord</label>
                <input
                  type="text"
                  placeholder="username#1234"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GitHub</label>
                <input
                  type="text"
                  placeholder="github.com/user"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn</label>
                <input
                  type="text"
                  placeholder="linkedin.com/in/user"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Calendly Link</label>
                <input
                  type="text"
                  placeholder="calendly.com/user"
                  value={calendly}
                  onChange={(e) => setCalendly(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{saveLoading ? "Saving..." : "Save Profile"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Skills Offered & Needed Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills Offered */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Skills {profileData.name} Teaches ({skills.length})</span>
            </h3>

            {skills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
            ) : (
              <div className="space-y-3">
                {skills.map((s) => (
                  <div key={s._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {s.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {s.level}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{s.title}</h4>
                    {s.description && (
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{s.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills Needed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>Skills {profileData.name} Wants to Learn</span>
            </h3>

            {profileData.skillsNeeded?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No learning goals listed yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profileData.skillsNeeded?.map((needed) => (
                  <span
                    key={needed}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold"
                  >
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    <span>{needed}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews & Testimonials Section */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>Reviews & Community Feedback ({reviews.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Feedback left by verified skill swap partners.
              </p>
            </div>

            {profileData.ratingAverage > 0 && (
              <div className="flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{profileData.ratingAverage.toFixed(1)} / 5.0</span>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No reviews received yet. Complete an exchange session to earn community reviews!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5"
                >
                  <img
                    src={
                      rev.reviewer?.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${rev.reviewer?.name || "User"}`
                    }
                    alt={rev.reviewer?.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-slate-800">{rev.reviewer?.name}</h4>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              rev.rating >= star
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Propose Swap Modal */}
      {!isOwnProfile && (
        <SwapModal
          isOpen={swapModalOpen}
          onClose={() => setSwapModalOpen(false)}
          targetUser={profileData}
          targetSkillTitle={selectedSkillTitle}
          onSuccess={() => alert("Swap proposal sent successfully!")}
        />
      )}
    </div>
  );
};

export default Profile;
