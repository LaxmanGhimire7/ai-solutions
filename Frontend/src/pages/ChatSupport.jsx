import { useEffect, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Chat Support</h1>
        <p className="mt-2 text-sm text-slate-500">Live chat sessions for admin support.</p>
      </div>

      <div className="grid min-h-[640px] gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="p-0">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-900">Conversations</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {sessions.length === 0 && (
              <div className="p-6 text-sm text-slate-500">No active conversations.</div>
            )}
            {sessions.map((session) => (
              <button
                key={session.sessionId}
                type="button"
                onClick={() => setActiveSession(session.sessionId)}
                className={`flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  activeSession === session.sessionId ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="rounded-full bg-slate-100 p-2 text-indigo-500">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{session.customerName || 'Visitor'}</div>
                  <div className="text-xs text-slate-400">{session.customerEmail || 'No email provided'}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col p-0">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-sm font-semibold text-slate-900">{current?.customerName || 'Select a conversation'}</h2>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {!current && <p className="text-sm text-slate-500">Choose a conversation to view messages.</p>}
            {current?.messages?.map((item, index) => (
              <div
                key={`${item.sender}-${index}`}
                className={`flex ${item.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md rounded-2xl px-4 py-2 text-sm ${
                    item.sender === 'admin'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.content}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 p-5">
            <div className="flex gap-3">
              <Input
                aria-label="Reply message"
                placeholder="Type a reply"
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
        </Card>
      </div>
    </div>
  );
};

export default ChatSupport;
