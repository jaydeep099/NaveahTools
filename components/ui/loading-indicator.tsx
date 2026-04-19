import { T } from "@/lib/tokens";

interface LoadingIndicatorProps {
  isLoading: boolean;
  message?: string;
}

export default function LoadingIndicator({ isLoading, message = "Processing..." }: LoadingIndicatorProps) {
  if (!isLoading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        backdropFilter: "blur(2px)"
      }}
    >
      <div
        style={{
          background: T.surface,
          borderRadius: 16,
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          minWidth: 280
        }}
      >
        {/* Spinner */}
        <div
          style={{
            width: 48,
            height: 48,
            border: `3px solid ${T.border}`,
            borderTopColor: T.blue,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }}
        />
        
        {/* Message */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: T.textPrimary,
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {message}
          </div>
        </div>

        {/* CSS Animation */}
        <style>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
