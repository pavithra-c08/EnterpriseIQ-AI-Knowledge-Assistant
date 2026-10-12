import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import { useSessionStore } from '../store/sessionStore';
import toast from 'react-hot-toast';

export default function Chat() {
  const { selectedSession, loadSessions } = useSessionStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    loadSessions().catch(() => toast.error('Failed to load sessions'));
  }, []);

  // Track viewport width
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-open sidebar on desktop, collapse on mobile
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    // Set initial state
    if (window.innerWidth >= 768) setSidebarOpen(true);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Mobile Backdrop Overlay ── */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar ── */}
      {isMobile ? (
        /* Mobile: fixed slide-over drawer */
        <div
          className="fixed top-0 left-0 h-full z-40 transition-transform duration-300"
          style={{
            width: '280px',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
          }}
        >
          <Sidebar onSessionSelect={closeSidebar} />
        </div>
      ) : (
        /* Desktop: inline collapsible column */
        <div
          className="transition-all duration-300 flex-shrink-0 overflow-hidden"
          style={{ width: sidebarOpen ? '260px' : '0px' }}
        >
          {sidebarOpen && <Sidebar onSessionSelect={() => {}} />}
        </div>
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <div
          className="flex items-center gap-2 px-3 py-3 border-b flex-shrink-0 md:gap-3 md:px-4"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl transition-all duration-200 flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {sidebarOpen && !isMobile ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
          <div className="flex-1 min-w-0">
            {selectedSession ? (
              <h2 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {selectedSession.title || 'Untitled Chat'}
              </h2>
            ) : (
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                No session selected
              </h2>
            )}
          </div>

          {selectedSession && (
            <span className="badge badge-emerald flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-slow" />
              <span className="hidden sm:inline">Active</span>
            </span>
          )}
        </div>

        {/* Chat Window */}
        <ChatWindow sessionId={selectedSession?.id} />

        {/* Chat Input */}
        <ChatInput sessionId={selectedSession?.id} />
      </div>
    </div>
  );
}
