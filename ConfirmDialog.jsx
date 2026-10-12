import { useEffect } from "react";
import { AlertTriangle, LogOut, X } from "lucide-react";

/**
 * ConfirmDialog – styled replacement for window.confirm / window.alert.
 *
 * Props:
 *   open        boolean
 *   variant     "danger" | "warning" | "logout"  (default: "danger")
 *   title       string
 *   message     string | ReactNode
 *   confirmText string
 *   cancelText  string  (default: "Cancel")
 *   onConfirm   () => void
 *   onCancel    () => void
 */
export default function ConfirmDialog({
  open,
  variant = "danger",
  title = "Are you sure?",
  message,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onCancel?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const configs = {
    danger: {
      iconBg: "rgba(220, 38, 38, 0.1)",
      iconBorder: "rgba(220, 38, 38, 0.2)",
      iconColor: "#DC2626",
      Icon: AlertTriangle,
      btnBg: "#DC2626",
      btnHover: "#B91C1C",
      btnShadow: "rgba(220, 38, 38, 0.3)",
      defaultConfirm: "Delete",
    },
    warning: {
      iconBg: "rgba(245, 158, 11, 0.1)",
      iconBorder: "rgba(245, 158, 11, 0.2)",
      iconColor: "#F59E0B",
      Icon: AlertTriangle,
      btnBg: "#F59E0B",
      btnHover: "#D97706",
      btnShadow: "rgba(245, 158, 11, 0.3)",
      defaultConfirm: "Confirm",
    },
    logout: {
      iconBg: "rgba(124, 58, 237, 0.1)",
      iconBorder: "rgba(124, 58, 237, 0.2)",
      iconColor: "#7C3AED",
      Icon: LogOut,
      btnBg: "#DC2626",
      btnHover: "#B91C1C",
      btnShadow: "rgba(220, 38, 38, 0.3)",
      defaultConfirm: "Logout",
    },
  };

  const cfg = configs[variant] ?? configs.danger;
  const finalConfirmText = confirmText ?? cfg.defaultConfirm;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel?.()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "fadeIn 0.15s ease forwards",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "22rem",
          background: "var(--bg-card)",
          border: "1px solid var(--border-medium)",
          borderRadius: "1.25rem",
          padding: "1.5rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)",
          animation: "dialogSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* Close x */}
        <button
          onClick={onCancel}
          title="Close"
          style={{
            position: "absolute",
            top: "0.75rem",
            right: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "1.75rem",
            height: "1.75rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "transparent",
            color: "var(--text-muted)",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-tertiary)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <X size={14} />
        </button>

        {/* Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "3rem",
            height: "3rem",
            borderRadius: "0.875rem",
            background: cfg.iconBg,
            border: `1px solid ${cfg.iconBorder}`,
            marginBottom: "1rem",
          }}
        >
          <cfg.Icon size={22} style={{ color: cfg.iconColor }} />
        </div>

        {/* Title */}
        <h3
          style={{
            margin: "0 0 0.4rem",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            paddingRight: "1.5rem",
          }}
        >
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p
            style={{
              margin: "0 0 1.4rem",
              fontSize: "0.8125rem",
              lineHeight: 1.55,
              color: "var(--text-secondary)",
            }}
          >
            {message}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: "0.625rem", marginTop: message ? 0 : "1.4rem" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "0.6rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid var(--border-medium)",
              background: "transparent",
              color: "var(--text-secondary)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "0.6rem 1rem",
              borderRadius: "0.75rem",
              border: "none",
              background: cfg.btnBg,
              color: "#fff",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s, box-shadow 0.15s, transform 0.1s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = cfg.btnHover;
              e.currentTarget.style.boxShadow = `0 4px 12px ${cfg.btnShadow}`;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = cfg.btnBg;
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {finalConfirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dialogSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}
