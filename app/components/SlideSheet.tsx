"use client";

import { useEffect } from "react";

interface SlideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: string;
  orientation?: "left" | "right";
  children: React.ReactNode;
}

export default function SlideSheet({
  isOpen,
  onClose,
  title = "",
  width = "350px",
  orientation = "right",
  children,
}: SlideSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Backdrop styles
  const maskStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 40,
    cursor: "pointer",
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? "auto" : "none",
    transition: "opacity 250ms",
  };

  // Sheet styles
  const sheetStyle: React.CSSProperties = {
    transition: `${orientation} 250ms, opacity 250ms`,
    background: "white",
    height: "100vh",
    width,
    position: "fixed",
    top: 0,
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  };

  // Set position based on orientation
  if (orientation === "right") {
    (sheetStyle as any).right = isOpen ? "0" : `calc(-1 * ${width})`;
  } else {
    (sheetStyle as any).left = isOpen ? "0" : `calc(-1 * ${width})`;
  }

  return (
    <>
      {/* Mask/Backdrop */}
      <div style={maskStyle} onClick={onClose} />

      {/* Side Sheet */}
      <aside style={sheetStyle}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem",
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "white",
          }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#111827",
              margin: 0,
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0.5rem",
              transition: "background-color 250ms",
              color: "#6b7280",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            overflowY: "auto",
            height: `calc(100vh - 3.3rem)`,
            flex: 1,
          }}
        >
          {children}
        </div>
      </aside>
    </>
  );
}
