"use client";

import { useEffect } from "react";
import { IoCheckmarkCircleOutline, IoAlertCircleOutline, IoInformationCircleOutline, IoClose } from "react-icons/io5";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <IoCheckmarkCircleOutline size={24} color="#4CAF50" />,
    error: <IoAlertCircleOutline size={24} color="#F44336" />,
    info: <IoInformationCircleOutline size={24} color="#2196F3" />
  };

  return (
    <div className={`toast-container toast-${type}`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        <IoClose size={20} />
      </button>

      <style jsx>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: var(--card-background);
          border: 1px solid var(--border);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 9999;
          min-width: 300px;
          max-width: 90vw;
          animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .toast-message {
          flex: 1;
          color: var(--foreground);
          font-size: 14px;
          font-weight: 500;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: var(--secondary-text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: background 0.2s;
        }

        .toast-close:hover {
          background: var(--input-background);
        }

        @keyframes slideUp {
          to {
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
