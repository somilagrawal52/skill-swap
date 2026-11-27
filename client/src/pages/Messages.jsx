import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getConversations,
  getMessagesWithUser,
  sendMessage,
  getUserProfile,
} from "../services/api";
import {
  Send,
  MessageSquare,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  User,
  Sparkles,
  ArrowRightLeft,
  Calendar,
  ExternalLink,
  Shield,
  Clock,
} from "lucide-react";

const Messages = () => {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialUserId = searchParams.get("user");
  const swapId = searchParams.get("swap");

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  // 1. Fetch all conversations list
  const fetchConversationsList = useCallback(async () => {
    try {
      const { data } = await getConversations();
      setConversations(data);
      return data;
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      return [];
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  // 2. Fetch messages with a specific user
  const fetchChatThread = useCallback(async (userId, silent = false) => {
    if (!userId) return;
    try {
      if (!silent) setLoadingMessages(true);
      const { data } = await getMessagesWithUser(userId);
      setSelectedUser(data.peer);
      setMessages(data.messages);
    } catch (err) {
      console.error("Failed to fetch messages with user:", err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const convos = await fetchConversationsList();

      if (initialUserId) {
        // If a user was passed via query params, load them
        const existingConvo = convos.find((c) => c.peer?._id === initialUserId);
        if (existingConvo) {
          setSelectedUser(existingConvo.peer);
          fetchChatThread(initialUserId);
        } else {
          // If this is a new conversation initiated from Profile or Swap
          try {
            const { data } = await getUserProfile(initialUserId);
            setSelectedUser(data.user);
            fetchChatThread(initialUserId);
          } catch (e) {
            console.error("Failed to load user profile:", e);
          }
        }
      } else if (convos.length > 0 && window.innerWidth >= 768) {
        // Default to first conversation on desktop
        setSelectedUser(convos[0].peer);
        fetchChatThread(convos[0].peer._id);
      }
    };
    init();
  }, [initialUserId, fetchConversationsList, fetchChatThread]);

  // Periodic polling for real-time messages (every 4 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversationsList();
      if (selectedUser?._id) {
        fetchChatThread(selectedUser._id, true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedUser?._id, fetchConversationsList, fetchChatThread]);

  // Scroll on message updates
  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length]);

  // Handle Send
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !selectedUser?._id || sending) return;

    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      sender: {
        _id: currentUser._id,
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      recipient: selectedUser,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    scrollToBottom(true);

    try {
      setSending(true);
      const { data } = await sendMessage(selectedUser._id, content, swapId || undefined);
      // Replace optimistic message with server response
      setMessages((prev) => prev.map((m) => (m._id === tempId ? data : m)));
      fetchConversationsList();
    } catch (err) {
      console.error("Failed to send message:", err);
      // Revert optimistic message on failure
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (peer) => {
    setSelectedUser(peer);
    setSearchParams({ user: peer._id });
    fetchChatThread(peer._id);
  };

  const filteredConversations = conversations.filter((c) =>
    c.peer?.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    c.peer?.headline?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-100 flex flex-col font-sans">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col py-4 px-2 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex h-[calc(100vh-8rem)]">
          {/* ================= LEFT SIDEBAR: CONVERSATION LIST ================= */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-white ${
              selectedUser && "hidden md:flex"
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h1 className="text-lg font-bold text-slate-900">Direct Messages</h1>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                {conversations.length} {conversations.length === 1 ? "Chat" : "Chats"}
              </span>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search chats by mentor..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 placeholder-slate-400 transition"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {loadingConversations ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-700">No conversations yet</p>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Start a conversation with a mentor from the{" "}
                    <Link to="/explore" className="text-indigo-600 font-bold hover:underline">
                      Explore Marketplace
                    </Link>{" "}
                    or from your Exchange Dashboard!
                  </p>
                </div>
              ) : (
                filteredConversations.map((convo) => {
                  const isSelected = selectedUser?._id === convo.peer?._id;
                  const hasUnread = convo.unreadCount > 0;
                  return (
                    <div
                      key={convo.peer?._id}
                      onClick={() => handleSelectConversation(convo.peer)}
                      className={`p-3.5 flex items-center gap-3 cursor-pointer transition relative ${
                        isSelected
                          ? "bg-indigo-50/70 border-l-4 border-indigo-600"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={
                            convo.peer?.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${convo.peer?.name || "User"}`
                          }
                          alt={convo.peer?.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h3 className="font-bold text-xs text-slate-900 truncate">
                            {convo.peer?.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(convo.lastMessage?.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <p className={`text-xs truncate ${hasUnread ? "font-bold text-slate-900" : "text-slate-500"}`}>
                          {convo.lastMessage?.sender === currentUser?._id && "You: "}
                          {convo.lastMessage?.content}
                        </p>
                      </div>

                      {hasUnread && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shrink-0">
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= RIGHT PANEL: ACTIVE CHAT ================= */}
          <div
            className={`flex-1 flex flex-col bg-slate-50 ${
              !selectedUser && "hidden md:flex items-center justify-center"
            }`}
          >
            {selectedUser ? (
              <>
                {/* Chat Top Header */}
                <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                      aria-label="Back to conversations"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                      <img
                        src={
                          selectedUser.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.name}`
                        }
                        alt={selectedUser.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-bold text-sm text-slate-900 leading-tight">
                            {selectedUser.name}
                          </h2>
                          {selectedUser.ratingAverage > 0 && (
                            <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-0.5">
                              ★ {selectedUser.ratingAverage.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                          {selectedUser.headline || selectedUser.location || "SkillSwap Community Member"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/profile/${selectedUser._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                      title="View public profile"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View Profile</span>
                    </Link>
                  </div>
                </div>

                {/* Optional Swap Context Notice Banner */}
                {swapId && (
                  <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-700 font-medium">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Coordinating Barter Session for Swap #{swapId.slice(-6)}</span>
                    </div>
                    <Link
                      to="/dashboard"
                      className="text-indigo-800 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>View in Dashboard</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* Chat Message Scroll Area */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
                >
                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading message history...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700 text-sm">
                        Say hello to {selectedUser.name}!
                      </p>
                      <p className="text-slate-400 text-[11px] max-w-xs text-center leading-relaxed">
                        Coordinate mentorship session details, ask questions, or align on scheduling.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.sender?._id === currentUser?._id;
                      const showAvatar =
                        !isMe &&
                        (index === messages.length - 1 ||
                          messages[index + 1]?.sender?._id !== msg.sender?._id);

                      return (
                        <div
                          key={msg._id || index}
                          className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          {!isMe && (
                            <div className="w-7 h-7 shrink-0">
                              {showAvatar ? (
                                <img
                                  src={
                                    selectedUser.avatar ||
                                    `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.name}`
                                  }
                                  alt={selectedUser.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                                />
                              ) : (
                                <div className="w-7" />
                              )}
                            </div>
                          )}

                          <div
                            className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed break-words ${
                              isMe
                                ? "bg-indigo-600 text-white rounded-br-xs"
                                : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs"
                            }`}
                          >
                            <p>{msg.content}</p>
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                isMe ? "text-indigo-200" : "text-slate-400"
                              }`}
                            >
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isMe && (
                                <span>
                                  {msg.isRead ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5 text-indigo-300" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Footer */}
                <form
                  onSubmit={handleSend}
                  className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder={`Message ${selectedUser.name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-400 transition"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0"
                    title="Send message (Enter)"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-inner">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Your Conversations</h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Select a conversation from the sidebar to chat with mentors and peers, or initiate a new swap from the Explore marketplace.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
