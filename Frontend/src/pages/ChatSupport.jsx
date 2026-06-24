import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Archive,
  CheckCheck,
  Circle,
  Headphones,
  Inbox,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Star,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';
import {
  connectAdmin,
  deleteChatSession,
  getChatSession,
  getChatSessions,
  joinAdmin,
  markChatRead,
  onChatEvent,
  sendAdminReply,
  updateChatStatus,
} from '@/api/chat';
import { useAuth } from '@/hooks/useAuth';

const sessionIdOf = (session) => String(session?._id || session?.sessionId || '');

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

const initials = (name = 'Visitor') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const sortSessions = (items) =>
  [...items].sort(
    (a, b) =>
      new Date(b.lastMessageAt || b.updatedAt || b.createdAt) -
      new Date(a.lastMessageAt || a.updatedAt || a.createdAt)
  );

const mergeSession = (items, incoming) => {
  const incomingId = sessionIdOf(incoming);
  const exists = items.some((item) => sessionIdOf(item) === incomingId);
  const next = exists
    ? items.map((item) =>
        sessionIdOf(item) === incomingId ? { ...item, ...incoming, _id: incomingId } : item
      )
    : [{ ...incoming, _id: incomingId }, ...items];
  return sortSessions(next);
};

const ChatSupport = () => {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const activeIdRef = useRef('');

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await getChatSessions({ page: 1, limit: 50 });
      setSessions(sortSessions(response.data || []));
    } catch (error) {
      toast.error(error.message || 'Unable to load support conversations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    const socket = connectAdmin(token);
    const handleConnect = () => {
      setIsConnected(true);
      joinAdmin(token).catch((error) => toast.error(error.message));
    };
    const handleDisconnect = () => setIsConnected(false);

    const cleanup = [
      onChatEvent('connect', handleConnect, token),
      onChatEvent('disconnect', handleDisconnect, token),
      onChatEvent('new_chat_session', (session) => {
        setSessions((current) => mergeSession(current, session));
      }, token),
      onChatEvent('customer_message', (payload) => {
        const id = String(payload.sessionId);
        setSessions((current) =>
          mergeSession(current, {
            _id: id,
            customerName: payload.customerName,
            customerEmail: payload.customerEmail,
            lastMessage: payload.message?.content,
            lastSender: 'customer',
            lastMessageAt: payload.lastMessageAt || payload.message?.createdAt,
            unreadCount: activeIdRef.current === id ? 0 : payload.unreadCount,
            online: true,
            status: 'active',
          })
        );
        setActiveChat((current) => {
          if (sessionIdOf(current) !== id) return current;
          markChatRead(id, token);
          return {
            ...current,
            unreadCount: 0,
            online: true,
            messages: [...(current.messages || []), payload.message],
          };
        });
      }, token),
      onChatEvent('admin_message', (payload) => {
        const id = String(payload.sessionId);
        setSessions((current) =>
          mergeSession(current, {
            _id: id,
            lastMessage: payload.message?.content,
            lastSender: 'admin',
            lastMessageAt: payload.lastMessageAt || payload.message?.createdAt,
          })
        );
        setActiveChat((current) =>
          sessionIdOf(current) === id
            ? { ...current, messages: [...(current.messages || []), payload.message] }
            : current
        );
      }, token),
      onChatEvent('system_message', (payload) => {
        const id = String(payload.sessionId);
        setActiveChat((current) =>
          sessionIdOf(current) === id
            ? { ...current, messages: [...(current.messages || []), payload.message] }
            : current
        );
      }, token),
      onChatEvent('session_presence', ({ sessionId, online }) => {
        setSessions((current) => mergeSession(current, { _id: String(sessionId), online }));
        setActiveChat((current) =>
          sessionIdOf(current) === String(sessionId) ? { ...current, online } : current
        );
      }, token),
      onChatEvent('chat_status', ({ sessionId, status, closedAt }) => {
        setSessions((current) =>
          mergeSession(current, { _id: String(sessionId), status, closedAt })
        );
        setActiveChat((current) =>
          sessionIdOf(current) === String(sessionId)
            ? { ...current, status, closedAt }
            : current
        );
      }, token),
      onChatEvent('chat_read', ({ sessionId }) => {
        setSessions((current) =>
          current.map((session) =>
            sessionIdOf(session) === String(sessionId)
              ? { ...session, unreadCount: 0 }
              : session
          )
        );
      }, token),
      onChatEvent('chat_rating', ({ sessionId, rating, ratingComment, ratedAt }) => {
        const update = { _id: String(sessionId), rating, ratingComment, ratedAt };
        setSessions((current) => mergeSession(current, update));
        setActiveChat((current) =>
          sessionIdOf(current) === String(sessionId) ? { ...current, ...update } : current
        );
      }, token),
      onChatEvent('chat_deleted', ({ sessionId }) => {
        const id = String(sessionId);
        setSessions((current) => current.filter((session) => sessionIdOf(session) !== id));
        setActiveChat((current) => (sessionIdOf(current) === id ? null : current));
        if (activeIdRef.current === id) {
          setActiveId('');
          activeIdRef.current = '';
        }
      }, token),
      onChatEvent('support_error', ({ message: errorMessage }) => {
        if (errorMessage) toast.error(errorMessage);
      }, token),
    ];

    if (socket.connected) handleConnect();

    return () => {
      cleanup.forEach((off) => off());
    };
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeChat?.messages]);

  const selectSession = async (session) => {
    const id = sessionIdOf(session);
    setActiveId(id);
    try {
      const response = await getChatSession(id);
      setActiveChat(response.data);
      setSessions((current) =>
        current.map((item) => (sessionIdOf(item) === id ? { ...item, unreadCount: 0 } : item))
      );
      markChatRead(id, token);
    } catch (error) {
      toast.error(error.message || 'Unable to open conversation');
    }
  };

  const filteredSessions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sessions.filter((session) => {
      const matchesSearch =
        !term ||
        `${session.customerName || ''} ${session.customerEmail || ''} ${session.lastMessage || ''}`
          .toLowerCase()
          .includes(term);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'unread' && session.unreadCount > 0) ||
        (filter === 'rated' && session.rating) ||
        (filter === 'closed' && session.status === 'closed');
      return matchesSearch && matchesFilter;
    });
  }, [filter, search, sessions]);

  const unreadTotal = sessions.reduce((sum, session) => sum + (session.unreadCount || 0), 0);
  const ratedSessions = sessions.filter((session) => session.rating);
  const averageRating = ratedSessions.length
    ? (
        ratedSessions.reduce((sum, session) => sum + session.rating, 0) /
        ratedSessions.length
      ).toFixed(1)
    : null;

  const handleSend = async () => {
    const cleanMessage = message.trim();
    if (!cleanMessage || !activeChat || activeChat.status === 'closed') return;

    setIsSending(true);
    try {
      await sendAdminReply({ sessionId: sessionIdOf(activeChat), content: cleanMessage }, token);
      setMessage('');
    } catch (error) {
      toast.error(error.message || 'Unable to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const handleStatus = async () => {
    if (!activeChat) return;
    const status = activeChat.status === 'closed' ? 'active' : 'closed';
    try {
      const response = await updateChatStatus(sessionIdOf(activeChat), status);
      const updated = response.data;
      setActiveChat(updated);
      setSessions((current) => mergeSession(current, updated));
      toast.success(status === 'closed' ? 'Conversation marked done' : 'Conversation reopened');
    } catch (error) {
      toast.error(error.message || 'Unable to update conversation');
    }
  };

  const handleDelete = async () => {
    if (!activeChat || activeChat.status !== 'closed') return;
    const confirmed = window.confirm(
      `Delete the completed conversation with ${activeChat.customerName || 'this visitor'}? This cannot be undone.`
    );
    if (!confirmed) return;

    const id = sessionIdOf(activeChat);
    try {
      await deleteChatSession(id);
      setSessions((current) => current.filter((session) => sessionIdOf(session) !== id));
      setActiveChat(null);
      setActiveId('');
      activeIdRef.current = '';
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error(error.message || 'Unable to delete conversation');
    }
  };

  return (
    <div className="min-h-screen bg-[#020706] p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E95520]/25 bg-[#E95520]/10 px-3 py-1 text-xs font-semibold text-[#F37A49]">
              <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
              Live support workspace
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white">Customer conversations</h1>
            <p className="mt-2 text-sm text-[#A89D96]">
              Reply in real time, track unread messages, and keep conversation history in MongoDB.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-medium text-amber-200">
              <Star className={`h-4 w-4 ${averageRating ? 'fill-current' : ''}`} />
              {averageRating ? `${averageRating}/5 from ${ratedSessions.length}` : 'No ratings yet'}
            </span>
            <span
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                isConnected
                  ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                  : 'border-red-400/20 bg-red-400/10 text-red-300'
              }`}
            >
              {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              {isConnected ? 'Realtime connected' : 'Realtime offline'}
            </span>
            <button
              type="button"
              onClick={loadSessions}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#A89D96] transition-colors hover:border-[#E95520]/35 hover:bg-[#E95520]/10 hover:text-[#F37A49]"
              aria-label="Refresh conversations"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid h-[calc(100vh-190px)] min-h-[650px] overflow-hidden rounded-2xl border border-white/10 bg-[#090a09] shadow-[0_20px_70px_rgba(0,0,0,0.28)] lg:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-b border-white/10 bg-[#080908] lg:border-b-0 lg:border-r">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white">Chats</h2>
                  <p className="mt-1 text-xs text-[#746C67]">{sessions.length} conversations</p>
                </div>
                {unreadTotal > 0 && (
                  <span className="rounded-full bg-[#E95520] px-2.5 py-1 text-xs font-semibold text-white">
                    {unreadTotal} unread
                  </span>
                )}
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#746C67]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversations"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.045] pl-10 pr-4 text-sm text-white outline-none placeholder:text-[#675F5A] focus:border-[#E95520]/60 focus:ring-2 focus:ring-[#E95520]/15"
                />
              </div>
              <div className="mt-3 flex gap-2">
                {[
                  ['all', 'All'],
                  ['unread', 'Unread'],
                  ['rated', 'Rated'],
                  ['closed', 'Done'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      filter === value
                        ? 'bg-[#E95520] text-white'
                        : 'bg-white/[0.05] text-[#A89D96] hover:bg-white/[0.09] hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {!isLoading && filteredSessions.length === 0 && (
                <div className="px-6 py-14 text-center">
                  <Inbox className="mx-auto h-8 w-8 text-[#5D5651]" />
                  <p className="mt-4 text-sm font-medium text-[#C8BDB6]">No conversations found</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#746C67]">
                    New live support messages will appear here automatically.
                  </p>
                </div>
              )}

              {filteredSessions.map((session) => {
                const id = sessionIdOf(session);
                const selected = id === activeId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectSession(session)}
                    className={`flex w-full items-start gap-3 border-b border-white/[0.06] px-4 py-4 text-left transition-colors ${
                      selected
                        ? 'bg-[#E95520]/12'
                        : 'hover:bg-white/[0.045]'
                    }`}
                  >
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2A1A14] text-sm font-semibold text-[#F37A49]">
                      {initials(session.customerName)}
                      {session.online && (
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#080908] bg-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-[#F5ECE6]">
                          {session.customerName || 'Visitor'}
                        </p>
                        <span className={`shrink-0 text-[11px] ${session.unreadCount ? 'text-[#F37A49]' : 'text-[#675F5A]'}`}>
                          {formatTime(session.lastMessageAt || session.updatedAt)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="min-w-0 flex-1 truncate text-xs text-[#8F847D]">
                          {session.lastSender === 'admin' && <CheckCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-400" />}
                          {session.lastMessage || session.customerEmail || 'Conversation started'}
                        </p>
                        {session.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E95520] px-1.5 text-[10px] font-bold text-white">
                            {session.unreadCount}
                          </span>
                        )}
                        {session.rating && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-300">
                            <Star className="h-3 w-3 fill-current" />
                            {session.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            {activeChat ? (
              <>
                <header className="flex min-h-[76px] items-center justify-between gap-4 border-b border-white/10 bg-[#0d0e0d] px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2A1A14] text-sm font-semibold text-[#F37A49]">
                      {initials(activeChat.customerName)}
                      {activeChat.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0d0e0d] bg-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-white">
                        {activeChat.customerName || 'Visitor'}
                      </h2>
                      <p className="mt-1 truncate text-xs text-[#746C67]">
                        {activeChat.online ? 'Online now' : activeChat.customerEmail || 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleStatus}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                        activeChat.status === 'closed'
                          ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15'
                          : 'border-white/10 bg-white/[0.04] text-[#A89D96] hover:border-[#E95520]/30 hover:bg-[#E95520]/10 hover:text-[#F37A49]'
                      }`}
                    >
                      <Archive className="h-4 w-4" />
                      {activeChat.status === 'closed' ? 'Reopen chat' : 'Mark done'}
                    </button>
                    {activeChat.status === 'closed' && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10 text-red-300 transition-colors hover:bg-red-400/20 hover:text-red-200"
                        aria-label="Delete completed conversation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </header>

                <div className="chat-wallpaper min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
                  <div className="mx-auto max-w-4xl space-y-3">
                    <div className="mx-auto mb-6 w-fit rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-[#8F847D]">
                      Conversation started {formatTime(activeChat.createdAt)}
                    </div>
                    {(activeChat.messages || []).map((item, index) => {
                      if (item.sender === 'system') {
                        return (
                          <div
                            key={item._id || `system-${item.createdAt}-${index}`}
                            className="mx-auto max-w-xl rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-center text-xs leading-relaxed text-[#8F847D]"
                          >
                            {item.content}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={item._id || `${item.sender}-${item.createdAt}-${index}`}
                          className={`flex ${item.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[68%] ${
                              item.sender === 'admin'
                                ? 'rounded-br-md bg-[#D94B19] text-white'
                                : 'rounded-bl-md border border-white/10 bg-[#171817] text-[#F5ECE6]'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{item.content}</p>
                            <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                              item.sender === 'admin' ? 'text-orange-100/80' : 'text-[#746C67]'
                            }`}>
                              {formatTime(item.createdAt)}
                              {item.sender === 'admin' && <CheckCheck className="h-3 w-3" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="border-t border-white/10 bg-[#0d0e0d] p-4">
                  {activeChat.status === 'closed' ? (
                    <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07] px-4 py-3 text-center">
                      <p className="text-sm text-emerald-200">
                        This conversation is marked done. Reopen it to send another reply.
                      </p>
                      {activeChat.rating ? (
                        <div className="mt-3 border-t border-emerald-300/10 pt-3">
                          <div className="flex justify-center gap-1 text-amber-300">
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star
                                key={index}
                                className={`h-4 w-4 ${
                                  index < activeChat.rating ? 'fill-current' : 'text-white/15'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mt-1 text-xs font-semibold text-amber-100">
                            Customer rating: {activeChat.rating}/5
                          </p>
                          {activeChat.ratingComment && (
                            <p className="mx-auto mt-1 max-w-xl text-xs leading-relaxed text-[#A89D96]">
                              “{activeChat.ratingComment}”
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-[#8F847D]">Waiting for customer feedback.</p>
                      )}
                    </div>
                  ) : (
                    <div className="mx-auto flex max-w-4xl items-end gap-3">
                      <textarea
                        rows="1"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Type a message"
                        className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white outline-none placeholder:text-[#675F5A] focus:border-[#E95520]/60 focus:ring-2 focus:ring-[#E95520]/15"
                      />
                      <Button
                        onClick={handleSend}
                        size="icon"
                        isLoading={isSending}
                        disabled={!message.trim()}
                        className="rounded-xl"
                        aria-label="Send reply"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="chat-wallpaper flex h-full min-h-[520px] flex-col items-center justify-center px-6 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E95520]/25 bg-[#E95520]/10 text-[#F37A49]">
                  <MessageSquare className="h-7 w-7" />
                </span>
                <h2 className="mt-5 text-lg font-semibold text-white">Your support inbox is ready</h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#8F847D]">
                  Select a conversation from the left. New visitors and unread messages will move to the top automatically.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-xs text-[#746C67]">
                  <Circle className={`h-2.5 w-2.5 fill-current ${isConnected ? 'text-emerald-400' : 'text-red-400'}`} />
                  {isConnected ? 'Waiting for customer messages' : 'Connect the realtime server to receive messages'}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;
