import { useEffect, useState } from 'react';
import { Circle, Headphones, MessageSquare, Send, UserRound } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { initSocket, joinAdmin, onCustomerMessage, onNewChatSession, sendAdminReply } from '@/api/chat';

const ChatSupport = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const socket = initSocket();
    joinAdmin();

    onNewChatSession((session) => {
      setSessions((current) => [{ ...session, messages: [] }, ...current]);
    });

    onCustomerMessage((payload) => {
      setSessions((current) =>
        current.map((session) =>
          session.sessionId === payload.sessionId
            ? {
                ...session,
                messages: [...(session.messages || []), { sender: 'customer', content: payload.message }],
              }
            : session
        )
      );
    });

    return () => {
      socket.off('new_chat_session');
      socket.off('customer_message');
    };
  }, []);

  const current = sessions.find((session) => session.sessionId === activeSession);

  const handleSend = () => {
    if (!message.trim() || !current) return;

    sendAdminReply({
      sessionId: current.sessionId,
      targetSocketId: current.socketId,
      content: message,
    });

    setSessions((items) =>
      items.map((session) =>
        session.sessionId === current.sessionId
          ? {
              ...session,
              messages: [...(session.messages || []), { sender: 'admin', content: message }],
            }
          : session
      )
    );
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.05)] md:p-8">
          <div className="pointer-events-none absolute -right-14 -top-16 h-44 w-64 rounded-2xl border border-indigo-100 bg-indigo-50" />
          <div className="relative flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Headphones className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase text-indigo-600">Live support workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Chat Support</h1>
              <p className="mt-2 text-sm text-slate-500">Manage active customer conversations in real time.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid min-h-[640px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)] lg:grid-cols-[340px_1fr]">
          <aside className="border-b border-slate-200 bg-slate-50 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between border-b border-slate-200 bg-white p-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">Conversations</h2>
                <p className="mt-1 text-xs text-slate-400">{sessions.length} active session(s)</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                <Circle className="h-2 w-2 fill-current" aria-hidden="true" />
                Online
              </span>
            </div>

            <div className="divide-y divide-slate-200">
              {sessions.length === 0 && (
                <div className="p-8 text-center">
                  <MessageSquare className="mx-auto h-7 w-7 text-slate-300" aria-hidden="true" />
                  <p className="mt-3 text-sm font-medium text-slate-600">No active conversations</p>
                  <p className="mt-1 text-xs text-slate-400">New customer chats will appear here.</p>
                </div>
              )}
              {sessions.map((session) => (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => setActiveSession(session.sessionId)}
                  className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    activeSession === session.sessionId ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-900">{session.customerName || 'Visitor'}</div>
                    <div className="mt-1 truncate text-xs text-slate-400">{session.customerEmail || 'No email provided'}</div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex min-h-[560px] flex-col">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-sm font-semibold text-slate-950">{current?.customerName || 'Select a conversation'}</h2>
              <p className="mt-1 text-xs text-slate-400">
                {current?.customerEmail || 'Choose a customer session to view and reply to messages.'}
              </p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-5 md:p-8">
              {!current && (
                <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-indigo-600 shadow-sm">
                    <MessageSquare className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <p className="mt-4 text-sm font-medium text-slate-700">Your support inbox is ready</p>
                  <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400">Select an active conversation from the left panel to start replying.</p>
                </div>
              )}
              {current?.messages?.map((item, index) => (
                <div key={`${item.sender}-${index}`} className={`flex ${item.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    item.sender === 'admin'
                      ? 'rounded-br-md bg-indigo-600 text-white'
                      : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                  }`}>
                    {item.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 bg-white p-4 md:p-5">
              <div className="flex gap-3">
                <Input
                  aria-label="Reply message"
                  placeholder={current ? 'Type a reply...' : 'Select a conversation first'}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSend();
                  }}
                  disabled={!current}
                />
                <Button onClick={handleSend} disabled={!current || !message.trim()} aria-label="Send reply">
                  <Send className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;
