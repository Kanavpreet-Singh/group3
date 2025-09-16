import { useState, useRef, useEffect } from 'react';

const FloatingChatbot = () => {
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const chatbotRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target) && expanded) {
        setExpanded(false);
      }
    }
    if (expanded) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  if (hidden) return null;

  return (
    <>
      {/* Collapsed State */}
      {!expanded && (
        <div className="fixed bottom-6 right-6 z-[1000]">
          <button
            aria-label="Open Mental Health Chatbot"
            className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary shadow-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105"
            onClick={() => setExpanded(true)}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <button
              className="absolute -top-2 -right-2 bg-gray-200 rounded-full w-6 h-6 text-sm text-gray-900 hover:bg-red-400 hover:text-white shadow transition-colors"
              aria-label="Hide chatbot permanently"
              onClick={(e) => {
                e.stopPropagation();
                setHidden(true);
              }}
            >
              ×
            </button>
          </button>
        </div>
      )}

      {/* Expanded State */}
      {expanded && (
        <div
          ref={chatbotRef}
          className="fixed bottom-6 right-6 z-[1000] bg-white rounded-xl shadow-2xl w-80 max-w-[90vw] h-[500px] flex flex-col border border-gray-200 animate-in slide-in-from-bottom-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-primary rounded-t-xl">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <h3 className="text-white font-semibold">Mental Health Support</h3>
            </div>
            <button
              aria-label="Minimize Chatbot"
              onClick={() => setExpanded(false)}
              className="text-white text-xl hover:text-gray-200 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg self-start max-w-[80%]">
              <p className="text-gray-800 text-sm">
                Hi! I'm your mental health support assistant. I'm here to help with questions about mental wellbeing, resources, and support options.
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg self-start max-w-[80%]">
              <p className="text-gray-800 text-sm">
                How can I support you today? You can ask about:
              </p>
              <ul className="text-xs text-gray-600 mt-2 space-y-1">
                <li>• Stress management techniques</li>
                <li>• Finding professional help</li>
                <li>• Crisis resources</li>
                <li>• Wellness tips</li>
              </ul>
            </div>
            <div className="mt-auto text-center">
              <p className="text-xs text-gray-400 italic bg-yellow-50 p-2 rounded">
                🚧 Demo Mode - Full AI chat functionality coming soon
              </p>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t bg-gray-50 rounded-b-xl">
            <div className="flex space-x-2">
              <input
                disabled
                type="text"
                className="flex-1 rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-700 placeholder-gray-400"
                placeholder="Type your message... (demo only)"
              />
              <button
                disabled
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium opacity-50 cursor-not-allowed"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              This chatbot is not a substitute for professional medical advice
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;
