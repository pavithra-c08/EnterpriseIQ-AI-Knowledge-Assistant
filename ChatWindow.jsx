import { useEffect, useRef } from 'react';
import { Bot, User, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 animate-fadeIn md:gap-3">
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 md:w-8 md:h-8" style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}>
        <Bot size={13} className="text-white" />
      </div>
      <div className="px-3 py-3 rounded-2xl rounded-tl-none md:px-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: '#2563EB',
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex items-start gap-2 animate-slideUp md:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white md:w-8 md:h-8"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #7C3AED, #2563EB)'
            : 'linear-gradient(135deg, #2563EB, #0891B2)',
        }}
      >
        {isUser ? <User size={12} /> : <Bot size={12} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[88%] space-y-2 md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className="px-3 py-2.5 rounded-2xl text-sm leading-relaxed md:px-4 md:py-3"
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  color: '#fff',
                  borderBottomRightRadius: '4px',
                }
              : {
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  borderBottomLeftRadius: '4px',
                }
          }
        >
          {msg.content}
        </div>

        {/* Sources */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold px-1" style={{ color: 'var(--text-muted)' }}>
              Sources
            </p>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {msg.sources.map((src, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium md:px-2.5"
                  style={{
                    background: 'rgba(37, 99, 235, 0.08)',
                    border: '1px solid rgba(37, 99, 235, 0.15)',
                    color: '#2563EB',
                  }}
                >
                  <FileText size={10} />
                  <span className="max-w-[120px] truncate md:max-w-[160px]">
                    {typeof src === 'string' ? src : src.source || src.file || `Source ${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs px-1" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default function ChatWindow({ sessionId }) {
  const { messages, isLoading, isSending, error, loadMessages } = useChatStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (sessionId) {
      loadMessages(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (!sessionId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-4 md:gap-6 md:p-8">
        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center glow-blue md:w-20 md:h-20"
            style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
          >
            <Bot size={30} className="text-white md:hidden" />
            <Bot size={36} className="text-white hidden md:block" />
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center md:w-6 md:h-6"
            style={{ background: '#16A34A', borderColor: 'var(--bg-primary)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-slow md:w-2 md:h-2" />
          </div>
        </div>
        <div className="text-center max-w-xs md:max-w-sm">
          <h2 className="text-xl font-bold mb-2 gradient-text md:text-2xl">EnterpriseIQ</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Select a chat session from the sidebar or create a new one to start asking questions about your documents.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 w-full max-w-xs sm:grid-cols-2 sm:max-w-sm md:gap-3">
          {['What are the key findings?', 'Summarize the document', 'Who is mentioned?', 'What are the next steps?'].map((suggestion) => (
            <div
              key={suggestion}
              className="px-3 py-2.5 rounded-xl text-xs font-medium text-center cursor-default"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin-slow" style={{ color: '#2563EB' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading messages…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 md:px-6 md:py-4">
      {error && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.15)', color: '#DC2626' }}
        >
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
          <MessageSquareEmptyIcon />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No messages yet</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Ask a question to get started</p>
        </div>
      ) : (
        messages.map((msg) => <Message key={msg.id} msg={msg} />)
      )}

      {isSending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageSquareEmptyIcon() {
  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
    >
      <Bot size={28} style={{ color: 'var(--text-muted)' }} />
    </div>
  );
}
