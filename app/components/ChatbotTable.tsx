"use client";

import { useState, useEffect } from "react";
import { Chatbot } from "@/services/chatbot";
import { formatDate } from "@/utils/dateFormat";
import { getApiKeys, ApiKeyInfo, getApiKey } from "@/services/apiKey";

interface ChatbotTableProps {
  chatbots: Chatbot[];
  isLoading: boolean;
  onEdit: (chatbot: Chatbot) => void;
  onDelete: (chatbot: Chatbot) => void;
  onGenerateUrl?: (chatbot: Chatbot) => void;
  onGetEmbedCode?: (chatbot: Chatbot) => void;
  isSuperAdmin?: boolean;
}

export default function ChatbotTable({
  chatbots,
  isLoading,
  onEdit,
  onDelete,
  onGenerateUrl,
  onGetEmbedCode,
  isSuperAdmin = false,
}: ChatbotTableProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);

  const fetchApiKeys = async () => {
    try {
      const response = await getApiKeys();
      setApiKeys(response.keys.filter((key: ApiKeyInfo) => key.is_active)); // Only show active keys
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleApiKeySelect = async (keyId: string) => {
    if (!keyId) {
      setSelectedApiKeyId('');
      setSelectedApiKey('');
      return;
    }
    try {
      const response = await getApiKey(keyId);
      setSelectedApiKeyId(keyId);
      setSelectedApiKey(response.api_key);
    } catch (error) {
      console.error('Failed to fetch API key:', error);
      // Could show error message
    }
  };

  const handleGenerateUrl = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setSelectedApiKeyId('');
    setSelectedApiKey('');
    setUrlModalOpen(true);
  };

  const handleGetEmbedCode = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setSelectedApiKeyId('');
    setSelectedApiKey('');
    setEmbedModalOpen(true);
  };

  const handleGenerateWidget = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot);
    setSelectedApiKeyId('');
    setSelectedApiKey('');
    setWidgetModalOpen(true);
  };

  const generateEmbedCode = (chatbot: Chatbot, apiKey: string) => {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    const embedUrl = `${frontendUrl}/chatbot?apiKey=${encodeURIComponent(apiKey)}&name=${encodeURIComponent(chatbot.name)}&chatbotId=${chatbot.id}`;
    
    return `<iframe 
  src="${embedUrl}" 
  width="400" 
  height="600" 
  frameborder="0"
  style="border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</iframe>`;
  };

  const generateUrlCode = (chatbot: Chatbot, apiKey: string) => {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    return `${frontendUrl}/chatbot?apiKey=${encodeURIComponent(apiKey)}&chatbotId=${chatbot.id}&name=${encodeURIComponent(chatbot.name)}`;
  };

  const generateWidgetCode = (chatbot: Chatbot, apiKey: string) => {
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
    const widgetUrl = `${frontendUrl}/chatbot-widget.js`;
    
    return `<script src="${widgetUrl}"></script>
<script>
  PADDEChatbot.init({
    apiKey: '${apiKey}',
    name: '${chatbot.name}',
    color: '#3b82f6',
    position: 'bottom-right'
  });
</script>`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || !navigator) {
        console.error('Clipboard API not available: not in browser environment');
        alert('Unable to copy to clipboard. Please copy the text manually.');
        return;
      }

      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
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
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 font-inter">Loading chatbots...</div>
      </div>
    );
  }

  if (chatbots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <svg
          className="w-12 h-12 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-4l-4 4v-4z"
          />
        </svg>
        <p className="text-gray-500 font-inter">No chatbots yet</p>
        <p className="text-gray-400 text-sm font-inter">
          Create your first chatbot to get started
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
              Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
              Description
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
              Created At
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold font-inter text-gray-900">
              Updated At
            </th>
            <th className="px-6 py-4 text-center text-sm font-semibold font-inter text-gray-900">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {chatbots.map((chatbot) => (
            <tr
              key={chatbot.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              onMouseEnter={() => setHoveredId(chatbot.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <td className="px-6 py-4 text-sm font-medium font-inter text-gray-900">
                {chatbot.name}
              </td>
              <td className="px-6 py-4 text-sm font-inter text-gray-600">
                <div className="truncate max-w-xs">{chatbot.description}</div>
              </td>
              <td className="px-6 py-4 text-sm font-inter text-gray-600">
                {formatDate(chatbot.created_at)}
              </td>
              <td className="px-6 py-4 text-sm font-inter text-gray-600">
                {formatDate(chatbot.updated_at)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(chatbot)}
                    className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-inter font-medium text-sm hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleGenerateUrl(chatbot)}
                    className="px-3 py-2 bg-green-50 text-green-600 rounded-lg font-inter font-medium text-sm hover:bg-green-100 transition-colors"
                  >
                    Generate URL
                  </button>
                  <button
                    onClick={() => handleGetEmbedCode(chatbot)}
                    className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg font-inter font-medium text-sm hover:bg-purple-100 transition-colors"
                  >
                    Get Embed Code
                  </button>
                  <button
                    onClick={() => handleGenerateWidget(chatbot)}
                    className="px-3 py-2 bg-orange-50 text-orange-600 rounded-lg font-inter font-medium text-sm hover:bg-orange-100 transition-colors"
                  >
                    Generate Widget
                  </button>
                  {isSuperAdmin && (
                    <button
                      onClick={() => onDelete(chatbot)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg font-inter font-medium text-sm hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* URL Modal */}
      {urlModalOpen && selectedChatbot && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold font-inter text-gray-900">
                  Generate URL
                </h3>
                <p className="text-sm text-gray-600 font-inter mt-1">
                  for {selectedChatbot.name}
                </p>
              </div>
              <button
                onClick={() => setUrlModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold font-inter text-gray-800 mb-3">
                  Select API Key
                </label>
                <select
                  value={selectedApiKeyId}
                  onChange={(e) => handleApiKeySelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl font-inter text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50 hover:bg-white"
                >
                  <option value="">Choose an API Key...</option>
                  {apiKeys.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name} ({key.key_prefix}...)
                    </option>
                  ))}
                </select>
                {apiKeys.length === 0 && (
                  <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-semibold font-inter text-amber-800">
                          No API keys found!
                        </h4>
                        <p className="text-sm text-amber-700 font-inter mt-1">
                          You need to create an API key first. Go to <strong>API Keys</strong> section to create one.
                        </p>
                        <button
                          onClick={() => window.open('/admin/api-key', '_blank')}
                          className="mt-3 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-inter font-medium hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
                        >
                          Go to API Keys
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedApiKey && (
                <div>
                  <label className="block text-sm font-semibold font-inter text-gray-800 mb-3">
                    Generated URL
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-mono text-gray-800 break-all leading-relaxed">
                      {generateUrlCode(selectedChatbot, selectedApiKey)}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateUrlCode(selectedChatbot, selectedApiKey))}
                    className="mt-4 w-full px-4 py-3 bg-green-600 text-white rounded-xl font-inter font-semibold text-sm hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copySuccess ? '✅ Copied!' : 'Copy URL'}
                  </button>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-semibold font-inter text-blue-800">
                      How to use
                    </h4>
                    <div className="text-sm text-blue-700 font-inter mt-1">
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Select an API Key from the dropdown above</li>
                        <li>Copy the generated URL</li>
                        <li>Share or use this URL to access the chatbot</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {embedModalOpen && selectedChatbot && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold font-inter text-gray-900">
                  Embed Code
                </h3>
                <p className="text-sm text-gray-600 font-inter mt-1">
                  for {selectedChatbot.name}
                </p>
              </div>
              <button
                onClick={() => setEmbedModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold font-inter text-gray-800 mb-3">
                  Select API Key
                </label>
                <select
                  value={selectedApiKeyId}
                  onChange={(e) => handleApiKeySelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl font-inter text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-gray-50 hover:bg-white"
                >
                  <option value="">Choose an API Key...</option>
                  {apiKeys.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name} ({key.key_prefix}...)
                    </option>
                  ))}
                </select>
                {apiKeys.length === 0 && (
                  <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-semibold font-inter text-amber-800">
                          No API keys found!
                        </h4>
                        <p className="text-sm text-amber-700 font-inter mt-1">
                          You need to create an API key first. Go to <strong>API Keys</strong> section to create one.
                        </p>
                        <button
                          onClick={() => window.open('/admin/api-key', '_blank')}
                          className="mt-3 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-inter font-medium hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
                        >
                          Go to API Keys
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedApiKey && (
                <div>
                  <label className="block text-sm font-semibold font-inter text-gray-800 mb-3">
                    Embed Code
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {generateEmbedCode(selectedChatbot, selectedApiKey)}
                    </pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateEmbedCode(selectedChatbot, selectedApiKey))}
                    className="mt-4 w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-inter font-semibold text-sm hover:bg-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copySuccess ? '✅ Copied!' : 'Copy Embed Code'}
                  </button>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-semibold font-inter text-blue-800">
                      How to embed
                    </h4>
                    <div className="text-sm text-blue-700 font-inter mt-1">
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Select an API Key from the dropdown above</li>
                        <li>Copy the generated embed code</li>
                        <li>Paste it into your website's HTML</li>
                        <li>The chatbot will appear as an iframe on your site</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widget Modal */}
      {widgetModalOpen && selectedChatbot && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold font-inter text-gray-900">
                  Generate Widget
                </h3>
                <p className="text-sm text-gray-600 font-inter mt-1">
                  for {selectedChatbot.name}
                </p>
              </div>
              <button
                onClick={() => setWidgetModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold font-inter text-gray-800 mb-3">
                  Select API Key
                </label>
                <select
                  value={selectedApiKeyId}
                  onChange={(e) => handleApiKeySelect(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl font-inter text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-gray-50 hover:bg-white"
                >
                  <option value="">Choose an API Key...</option>
                  {apiKeys.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name} ({key.key_prefix}...)
                    </option>
                  ))}
                </select>
                {apiKeys.length === 0 && (
                  <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-semibold font-inter text-amber-800">
                          No API keys found!
                        </h4>
                        <p className="text-sm text-amber-700 font-inter mt-1">
                          You need to create an API key first. Go to <strong>API Keys</strong> section to create one.
                        </p>
                        <button
                          onClick={() => window.open('/admin/api-key', '_blank')}
                          className="mt-3 px-4 py-2 bg-amber-600 text-white text-sm rounded-lg font-inter font-medium hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
                        >
                          Go to API Keys
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedApiKey && (
                <div>
                  <label className="block text-sm font-semibold font-inter text-gray-800 mb-3">
                    Widget Code
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {generateWidgetCode(selectedChatbot, selectedApiKey)}
                    </pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateWidgetCode(selectedChatbot, selectedApiKey))}
                    className="mt-4 w-full px-4 py-3 bg-orange-600 text-white rounded-xl font-inter font-semibold text-sm hover:bg-orange-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {copySuccess ? '✅ Copied!' : 'Copy Widget Code'}
                  </button>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-semibold font-inter text-blue-800">
                      How to use the widget
                    </h4>
                    <div className="text-sm text-blue-700 font-inter mt-1">
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Select an API Key from the dropdown above</li>
                        <li>Copy the generated widget code</li>
                        <li>Paste the code into the &lt;head&gt; or &lt;body&gt; section of your website's HTML</li>
                        <li>The chatbot widget will appear on your website with a floating button</li>
                        <li>Users can click the button to open the chat interface</li>
                      </ol>
                      <p className="mt-2 text-xs">
                        <strong>Note:</strong> Ensure the chatbot-widget.js file is accessible at the specified URL. You may need to host it on your server or use a CDN.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
