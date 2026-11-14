import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getUserSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  updateMyProfile,
} from "../services/api";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  GraduationCap,
  AlertCircle,
  Tag,
  BookOpen,
} from "lucide-react";

const CATEGORIES = [
  "Development & IT",
  "Design & Creative",
  "Languages",
  "Marketing & Business",
  "Music & Audio",
  "Academics",
  "Fitness & Health",
  "Lifestyle & Other",
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

const Skills = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [mySkills, setMySkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // New skill form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Development & IT");
  const [level, setLevel] = useState("Intermediate");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Editing skill state
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLevel, setEditLevel] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");

  // Skills Needed state
  const [neededInput, setNeededInput] = useState("");
  const [skillsNeeded, setSkillsNeeded] = useState(user?.skillsNeeded || []);

  const fetchSkills = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const { data } = await getUserSkills(user._id);
      setMySkills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchSkills();
    if (user?.skillsNeeded) {
      setSkillsNeeded(user.skillsNeeded);
    }
  }, [fetchSkills, user?.skillsNeeded]);

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Skill title is required");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      await createSkill({
        title: title.trim(),
        category,
        level,
        description: description.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });

      setTitle("");
      setDescription("");
      setTags("");
      setShowAddForm(false);
      await fetchSkills();
      refreshUser();
    } catch (err) {
      setFormError(err.response?.data?.msg || "Could not add skill.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (skill) => {
    setEditingSkillId(skill._id);
    setEditTitle(skill.title);
    setEditCategory(skill.category || "Development & IT");
    setEditLevel(skill.level || "Intermediate");
    setEditDescription(skill.description || "");
    setEditTags(skill.tags?.join(", ") || "");
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateSkill(id, {
        title: editTitle.trim(),
        category: editCategory,
        level: editLevel,
        description: editDescription.trim(),
        tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setEditingSkillId(null);
      await fetchSkills();
      refreshUser();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update skill.");
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this skill listing?")) return;
    try {
      await deleteSkill(id);
      await fetchSkills();
      refreshUser();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to delete skill.");
    }
  };

  // Skills Needed tag management
  const handleAddNeeded = async (e) => {
    e.preventDefault();
    const clean = neededInput.trim();
    if (!clean || skillsNeeded.includes(clean)) return;

    const updated = [...skillsNeeded, clean];
    setSkillsNeeded(updated);
    setNeededInput("");

    try {
      const { data } = await updateMyProfile({ skillsNeeded: updated });
      updateUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveNeeded = async (skillToRemove) => {
    const updated = skillsNeeded.filter((s) => s !== skillToRemove);
    setSkillsNeeded(updated);
    try {
      const { data } = await updateMyProfile({ skillsNeeded: updated });
      updateUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dual-Skill Matrix</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Your Skills</h1>
          <p className="mt-2 text-sm text-slate-600">
            Define what you can teach to other members and specify what you want to learn in return.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: SKILLS I CAN TEACH */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span>Skills I Can Teach ({mySkills.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    These appear on the public marketplace for others to request.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition"
                >
                  {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{showAddForm ? "Cancel" : "Add New Skill"}</span>
                </button>
              </div>

              {/* Add Skill Form */}
              {showAddForm && (
                <form
                  onSubmit={handleCreateSkill}
                  className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 mb-6 space-y-4 animate-fade-in"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                    Add a New Skill Listing
                  </h3>

                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Skill Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Modern React with Hooks"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Proficiency Level
                      </label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {lvl}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. React, JavaScript, Vite, Web"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description & What You'll Cover
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explain what practical knowledge, projects, or exercises you'll walk through during exchange sessions..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                    >
                      {submitting ? "Publishing..." : "Publish Skill"}
                    </button>
                  </div>
                </form>
              )}

              {/* Skills List */}
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading your skills...</div>
              ) : mySkills.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No skills listed yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1 mb-3">
                    Add at least one skill so peers can propose exchanges with you.
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition"
                  >
                    + Add Your First Skill
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mySkills.map((skill) => {
                    const isEditing = editingSkillId === skill._id;

                    return (
                      <div
                        key={skill._id}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all"
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                                placeholder="Skill Title"
                              />
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                              >
                                {CATEGORIES.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <select
                                value={editLevel}
                                onChange={(e) => setEditLevel(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                              >
                                {LEVELS.map((lvl) => (
                                  <option key={lvl} value={lvl}>
                                    {lvl}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={editTags}
                                onChange={(e) => setEditTags(e.target.value)}
                                className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                                placeholder="Tags (comma separated)"
                              />
                            </div>

                            <textarea
                              rows={2}
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs resize-none"
                              placeholder="Description"
                            ></textarea>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingSkillId(null)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(skill._id)}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                                  {skill.category}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                                  {skill.level}
                                </span>
                              </div>

                              <h3 className="text-sm font-bold text-slate-900">{skill.title}</h3>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {skill.description || "No description provided."}
                              </p>

                              {skill.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                  {skill.tags.map((t) => (
                                    <span
                                      key={t}
                                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 flex items-center gap-1"
                                    >
                                      <Tag className="w-2.5 h-2.5 text-slate-400" /> {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => handleStartEdit(skill)}
                                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-white transition"
                                title="Edit Skill"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSkill(skill._id)}
                                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-white transition"
                                title="Delete Skill"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: SKILLS I WANT TO LEARN */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  <span>Skills I Want to Learn</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Our algorithm matches you with users who offer these skills!
                </p>
              </div>

              {/* Add desired skill form */}
              <form onSubmit={handleAddNeeded} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="e.g. Conversational Spanish..."
                  value={neededInput}
                  onChange={(e) => setNeededInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition"
                >
                  Add
                </button>
              </form>

              {/* Badges List */}
              <div className="flex flex-wrap gap-2">
                {skillsNeeded.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No learning goals added yet. Add a skill above to activate Smart Matching!
                  </p>
                ) : (
                  skillsNeeded.map((skillName) => (
                    <span
                      key={skillName}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold"
                    >
                      <span>{skillName}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveNeeded(skillName)}
                        className="p-0.5 hover:bg-purple-200 rounded-full transition"
                      >
                        <X className="w-3 h-3 text-purple-600" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Smart Match Engine Active</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Whenever someone on the platform offers one of your requested skills, they will appear highlighted on your Marketplace feed.
                </p>
                <Link
                  to="/explore"
                  className="inline-block text-indigo-600 font-bold underline text-[11px] mt-1"
                >
                  View current matches on Explore →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;
