"use client";

import { useState } from "react";

interface AdminCredentials {
  name: string;
  email: string;
  password?: string;
}

interface AdminCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationName: string;
  admin: AdminCredentials;
}

export default function AdminCredentialsModal({
  isOpen,
  onClose,
  organizationName,
  admin,
}: AdminCredentialsModalProps) {
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: string) => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !navigator) {
        console.error('Clipboard API not available: not in browser environment');
        alert('Unable to copy to clipboard. Please copy the text manually.');
        return;
      }

      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        setCopied({ ...copied, [field]: true });
        setTimeout(() => {
          setCopied({ ...copied, [field]: false });
        }, 2000);
      } else {
        // Fallback for older browsers or environments without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand('copy');
          if (successful) {
            setCopied({ ...copied, [field]: true });
            setTimeout(() => {
              setCopied({ ...copied, [field]: false });
            }, 2000);
          } else {
            throw new Error('Copy command failed');
          }
        } catch (err) {
          console.error('Fallback copy failed:', err);
          // Show user-friendly error message
          alert('Unable to copy to clipboard. Please copy the text manually.');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Show user-friendly error message
      alert('Unable to copy to clipboard. Please copy the text manually.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 font-inter">
              Organization Created Successfully!
            </h3>
            <p className="text-sm text-gray-500 font-inter">
              {organizationName}
            </p>
          </div>
        </div>

        {/* Admin Credentials */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h4 className="text-sm font-semibold text-blue-900 font-inter">
              Admin User Created
            </h4>
          </div>

          <div className="space-y-3">
            {/* Admin Name */}
            <div>
              <label className="block text-xs font-medium text-blue-900 mb-1 font-inter">
                Name
              </label>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-200">
                <input
                  type="text"
                  value={admin.name}
                  readOnly
                  className="flex-1 text-sm font-inter text-gray-900 bg-transparent border-none outline-none"
                />
                <button
                  onClick={() => copyToClipboard(admin.name, "name")}
                  className="text-blue-600 hover:text-blue-700 transition"
                  title="Copy"
                >
                  {copied.name ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Admin Email */}
            <div>
              <label className="block text-xs font-medium text-blue-900 mb-1 font-inter">
                Email
              </label>
              <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-200">
                <input
                  type="text"
                  value={admin.email}
                  readOnly
                  className="flex-1 text-sm font-inter text-gray-900 bg-transparent border-none outline-none"
                />
                <button
                  onClick={() => copyToClipboard(admin.email, "email")}
                  className="text-blue-600 hover:text-blue-700 transition"
                  title="Copy"
                >
                  {copied.email ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Admin Password - Only show if auto-generated */}
            {admin.password && (
              <div>
                <label className="block text-xs font-medium text-blue-900 mb-1 font-inter">
                  Password
                </label>
                <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-200">
                  <input
                    type="text"
                    value={admin.password}
                    readOnly
                    className="flex-1 text-sm font-inter text-gray-900 bg-transparent border-none outline-none font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(admin.password!, "password")}
                    className="text-blue-600 hover:text-blue-700 transition"
                    title="Copy"
                  >
                    {copied.password ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        {admin.password && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-amber-800 font-inter">
                <strong>Important:</strong> Please save these credentials securely. The password will not be shown again!
              </p>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-3 bg-slate-900 text-white font-inter font-medium rounded-lg hover:bg-black transition"
        >
          Got it, Close
        </button>
      </div>
    </div>
  );
}
