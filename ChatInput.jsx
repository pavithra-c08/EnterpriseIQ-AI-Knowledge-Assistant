import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useChatStore } from '../store/chatStore';

export default function ChatInput({ sessionId }) {
  const [text, setText] = useState('');
  const { sendMessage, isSending } = useChatStore();
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }, [text]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSending || !sessionId) return;

    setText('');
    try {
      await sendMessage(sessionId, trimmed);
    } catch {
      // Error handled in store
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="px-3 py-3 border-t md:px-6 md:py-4"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}
    >
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2.5 transition-all duration-200 md:gap-3 md:px-4 md:py-3"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.5)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-medium)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!sessionId || isSending}
            placeholder={
              !sessionId
                ? 'Select or create a session first…'
                : 'Ask anything about your documents…'
            }
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none"
            style={{
              color: 'var(--text-primary)',
              lineHeight: '1.6',
              maxHeight: '160px',
            }}
          />

          <button
            type="submit"
            disabled={!text.trim() || !sessionId || isSending}
            className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background:
                text.trim() && sessionId && !isSending
                  ? 'linear-gradient(135deg, #2563EB, #7C3AED)'
                  : 'var(--bg-tertiary)',
              cursor: text.trim() && sessionId && !isSending ? 'pointer' : 'not-allowed',
            }}
          >
            {isSending ? (
              <Loader2 size={14} className="text-white animate-spin" />
            ) : (
              <Send
                size={14}
                style={{
                  color: text.trim() && sessionId ? '#fff' : 'var(--text-muted)',
                  transform: 'translateX(1px)',
                }}
              />
            )}
          </button>
        </div>

        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
          EnterpriseIQ may make mistakes. Always verify important information.
        </p>
      </form>
    </div>
  );
}
