import { useMemo, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { sendMessage } from '@/api/chatbot';

const quickQuestions = [
  'What services do you offer?',
  'How much does a project cost?',
  'Do you have upcoming events?',
  'How can I schedule a demo?',
  'How do I submit a job request?',
];

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      content: 'Hello. Ask me about services, pricing, events, demos, or job submissions.',
    },
  ]);
  const inputRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  const openWidget = () => {
    setIsOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submitMessage = async (messageText = input) => {
    const cleanMessage = messageText.trim();
    if (!cleanMessage) return;

    setMessages((current) => [...current, { sender: 'user', content: cleanMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(cleanMessage);
      setMessages((current) => [
        ...current,
        {
          sender: 'bot',
          content: response.data?.answer || 'Please contact our support team for more details.',
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { sender: 'bot', content: 'Please contact our support team for more details.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen && (
        <section
          className="mb-4 flex h-[520px] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          aria-label="FAQ chatbot"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                <Bot className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">AI-Solutions Assistant</h2>
                <p className="text-xs text-slate-400">Rule-based FAQ support</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.sender}-${index}`}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    message.sender === 'user'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-500">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 px-5 py-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => submitMessage(question)}
                  className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {question}
                </button>
              ))}
            </div>

            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitMessage();
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your question"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                aria-label="Chatbot message"
              />
              <Button type="submit" disabled={!canSend} aria-label="Send chatbot message">
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={isOpen ? () => setIsOpen(false) : openWidget}
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm transition-colors hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:ring-offset-2"
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <MessageCircle className="h-5 w-5" aria-hidden="true" />}
      </button>
    </div>
  );
};

export default ChatbotWidget;
