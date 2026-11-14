import { useCallback, useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/auth-context";
import {
  getMyRequests,
  getUserSkills,
  respondSwapRequest,
  searchUsersBySkill,
  sendSwapRequest,
} from "../services/api";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search state
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mySkills, setMySkills] = useState([]);
  const [offeredSkill, setOfferedSkill] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await getMyRequests();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySkills = useCallback(async () => {
    try {
      const { data } = await getUserSkills(user._id);
      setMySkills(data);
      setOfferedSkill((current) => current || data[0]?.title || "");
    } catch (error) {
      console.error("Error fetching your skills:", error);
    }
  }, [user._id]);

  useEffect(() => {
    fetchRequests();
    fetchMySkills();
  }, [fetchMySkills]);

  const handleRespond = async (requestId, status) => {
    try {
      await respondSwapRequest(requestId, status);
      fetchRequests();
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    try {
      setSearchLoading(true);
      const { data } = await searchUsersBySkill(search);
      setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRequestSwap = async (toUser, requestedSkill) => {
    if (!offeredSkill) {
      alert("Add a skill first, then choose it as the skill you offer.");
      return;
    }

    try {
      await sendSwapRequest(toUser, offeredSkill, requestedSkill);
      alert("Swap request sent!");
    } catch (error) {
      alert(error.response?.data?.msg || "Could not send the swap request");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar (Desktop + Mobile toggle) */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-blue-600">Skill Swap</h2>
          <p className="mt-2 text-gray-600">Welcome, {user?.name}</p>
          <Link
            to="/skills"
            className="mt-4 block text-center text-blue-600 hover:text-blue-700"
          >
            Manage skills
          </Link>
          <button
            onClick={logout}
            className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 lg:ml-64">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {user?.name}'s Dashboard
          </h1>
          <button
            className="lg:hidden p-2 text-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6 flex">
          <input
            type="text"
            placeholder="Search for skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </form>

        {/* Search Results */}
        {searchLoading ? (
          <p className="text-gray-500">Searching...</p>
        ) : searchResults.length > 0 ? (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Search Results</h2>
            {mySkills.length > 0 ? (
              <label className="mb-4 block text-sm text-gray-700">
                Offer one of your skills
                <select
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
                >
                  {mySkills.map((skill) => (
                    <option key={skill._id} value={skill.title}>
                      {skill.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="mb-4 text-sm text-amber-700">
                Add a skill before sending a swap request.
              </p>
            )}
            <ul className="space-y-3">
              {searchResults.map((u) => (
                <li
                  key={u._id}
                  className="flex justify-between items-center border rounded-lg p-4"
                >
                  <div>
                    <p className="font-medium text-gray-800">{u.name}</p>
                    <p className="text-sm text-gray-600">
                      Skills:{" "}
                      <span className="text-blue-600 font-medium">
                        {u.skills.join(", ")}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {u.skills.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => handleRequestSwap(u._id, skill)}
                        disabled={!mySkills.length}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        Request {skill}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Requests Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">My Swap Requests</h2>

          {loading ? (
            <p className="text-gray-500">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="text-gray-500">No requests yet.</p>
          ) : (
            <ul className="space-y-4">
              {requests.map((req) => (
                <li
                  key={req._id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p>
                      <strong>{req.fromUser?.name}</strong> wants to swap{" "}
                      <span className="text-blue-600 font-medium">
                        {req.requestedSkill}
                      </span>{" "}
                      for{" "}
                      <span className="text-green-600 font-medium">
                        {req.offeredSkill}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Status:{" "}
                      <span
                        className={`font-medium ${
                          req.status === "pending"
                            ? "text-yellow-500"
                            : req.status === "accepted"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {req.status}
                      </span>
                    </p>
                  </div>

                  {req.status === "pending" && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleRespond(req._id, "accepted")}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRespond(req._id, "declined")}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
