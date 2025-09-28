"use client"

import { useState, useContext, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import PreviousConversations from "../components/PreviousConversations"
import jsPDF from 'jspdf'

const API_BASE = import.meta.env.VITE_API_URL // Node.js backend
const AI_API = "http://localhost:5001/api/ai-response" // Flask AI API

const AskAi = () => {
  const { currentUser } = useContext(AuthContext)
  const token = localStorage.getItem("token")
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false) // AI typing indicator
  const [starting, setStarting] = useState(false) // Loader for Start Chat
  const [conversation, setConversation] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [previousConversations, setPreviousConversations] = useState([])

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Auto-scroll to bottom
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
  }, [messages])

  // Redirect if no token
  useEffect(() => {
    if (!token) navigate("/signin")
  }, [navigate, token])

  // Fetch all previous conversations
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chats/allchats`, {
        method: "GET",
        headers: { "Content-Type": "application/json", token },
      })
      const data = await res.json()
      if (res.ok) setPreviousConversations(data || [])
    } catch (err) {
      console.error("Error fetching conversations:", err)
    }
  }

  const deleteConversation = async (conversationId) => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/chats/conversation/${conversationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", token },
      })
      
      if (res.ok) {
        // Remove from previous conversations list
        setPreviousConversations(prev => prev.filter(conv => conv.id !== conversationId))
        
        // If this was the current conversation, clear it
        if (conversation?.id === conversationId) {
          setConversation(null)
          setMessages([])
        }
      }
    } catch (err) {
      console.error("Error deleting conversation:", err)
    }
  }

  const downloadConversationAsPDF = () => {
    if (!messages.length) return;

    try {
      const pdf = new jsPDF();
      const lineHeight = 10;
      let yPosition = 20;

      // Add title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("NeuroCare AI Conversation", 20, yPosition);
      yPosition += lineHeight * 2;

      // Add timestamp
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition);
      yPosition += lineHeight * 2;

      // Add messages
      pdf.setFontSize(11);
      messages.forEach((msg) => {
        if (msg.typing) return; // Skip typing indicators

        // Add sender
        pdf.setFont("helvetica", "bold");
        const sender = msg.sender === "user" ? "You" : "NeuroCare AI";
        pdf.text(`${sender}:`, 20, yPosition);
        yPosition += lineHeight;

        // Add message text
        pdf.setFont("helvetica", "normal");
        const messageLines = pdf.splitTextToSize(msg.text, 170); // Split long messages
        messageLines.forEach(line => {
          // Check if we need a new page
          if (yPosition > 280) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, 20, yPosition);
          yPosition += lineHeight;
        });

        yPosition += lineHeight; // Add space between messages
      });

      // Save the PDF
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      pdf.save(`neurocare-conversation-${timestamp}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const res = await fetch(`${API_BASE}/api/chats/messages/${conversationId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", token },
      })
      const messages = await res.json()
      if (res.ok) {
        return messages.map(msg => ({
          sender: msg.sender === 'bot' ? 'ai' : 'user',
          text: msg.message
        }))
      }
      return []
    } catch (err) {
      console.error("Error fetching messages:", err)
      return []
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  // Start a new conversation
  const startConversation = async () => {
    try {
      setStarting(true)
      const title = new Date().toLocaleString()
      const res = await fetch(`${API_BASE}/api/chats/newconversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({ title }),
      })
      const data = await res.json()
      setConversation(data.conversation)

      // Refresh previous conversations
      fetchConversations()

      const welcome = "Hi! I'm NeuroCare AI. How can I help you today?"
      setMessages([{ sender: "ai", text: welcome }])

      await fetch(`${API_BASE}/api/chats/newmessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({
          conversationId: data.conversation.id,
          sender: "bot",
          message: welcome,
        }),
      })
    } catch (err) {
      console.error("Error starting conversation:", err)
    } finally {
      setStarting(false)
    }
  }

  // Handle sending a user message
  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || !conversation) return

    const userMessage = input.trim()
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }])
    setInput("")

    await fetch(`${API_BASE}/api/chats/newmessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token },
      body: JSON.stringify({
        conversationId: conversation.id,
        sender: "user",
        message: userMessage,
      }),
    })

    // AI typing indicator
    setLoading(true)
    setMessages((prev) => [...prev, { sender: "ai", text: "Typing...", typing: true }])

    try {
      const res = await fetch(AI_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })
      const data = await res.json()

      setMessages((prev) =>
        prev.map((msg) => (msg.typing ? { sender: "ai", text: data.aiResponse } : msg))
      )

      await fetch(`${API_BASE}/api/chats/newmessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({
          conversationId: conversation.id,
          sender: "bot",
          message: data.aiResponse,
        }),
      })
    } catch (err) {
      console.error("Error fetching AI response:", err)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.typing ? { sender: "ai", text: "Something went wrong. Please try again." } : msg
        )
      )
    } finally {
      setLoading(false)
    }
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <button
          onClick={startConversation}
          disabled={starting}
          className="bg-yellow text-black px-6 py-4 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {starting ? (
            <>
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              Starting...
            </>
          ) : (
            "Start Chat"
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <aside className="hidden md:block w-80 border-r border-gray bg-blue">
        <PreviousConversations
          conversations={previousConversations}
          currentConversationId={conversation?.id}
          onSelectConversation={async (conv) => {
            setConversation(conv)
            const messages = await fetchMessages(conv.id)
            setMessages(messages)
          }}
          onDeleteConversation={deleteConversation}
        />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-20 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative w-72 bg-blue p-4 shadow-lg">
            <button
              className="absolute top-2 right-2 text-yellow font-bold"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
            <PreviousConversations
              conversations={previousConversations}
              onSelectConversation={async (conv) => {
                setConversation(conv)
                const messages = await fetchMessages(conv.id)
                setMessages(messages)
                setSidebarOpen(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Main chat */}
      <section className="flex-1 flex flex-col min-h-0">
        <header className="sticky top-0 z-10 bg-blue border-b border-gray p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-yellow">Ask AI</h1>
            <p className="text-sm text-gray mt-1">Get personalized support and guidance</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Download Button - Only visible when there are messages */}
            {messages.length > 0 && (
              <button
                onClick={downloadConversationAsPDF}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                title="Download conversation as PDF"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3M3 17V7a2 2 0 012-2h14a2 2 0 012 2v10" />
                </svg>
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>
            )}
            
            {/* Book Appointment Button - Only visible for students */}
            {currentUser?.role === 'student' && (
              <button
                onClick={() => navigate('/book')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">Book Appointment</span>
                <span className="sm:hidden">Book</span>
              </button>
            )}
            
            {/* Menu Button - Only visible on mobile */}
            <button
              type="button"
              className="md:hidden inline-flex items-center gap-2 rounded-md border border-gray bg-blue px-3 py-2 text-sm hover:bg-yellow hover:text-black transition"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h10v2H4z" />
              </svg>
            </button>
          </div>
        </header>

        <main ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "ai" && (
                <div
                  className="h-8 w-8 shrink-0 rounded-full bg-yellow text-black grid place-items-center text-xs font-semibold"
                  title="NeuroCare AI"
                >
                  AI
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border ${
                  msg.sender === "user"
                    ? "bg-yellow text-black border-transparent"
                    : "bg-blue text-white border-gray"
                }`}
              >
                <div className="text-xs font-medium opacity-80 mb-1">
                  {msg.sender === "user" ? "You" : "NeuroCare AI"}
                </div>
                <p className="text-sm leading-relaxed flex items-center gap-2">
                  {msg.typing && (
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  )}
                  {msg.text}
                </p>
              </div>
              {msg.sender === "user" && (
                <div
                  className="h-8 w-8 shrink-0 rounded-full bg-gray text-black/80 grid place-items-center text-xs font-semibold"
                  title={currentUser?.name || "You"}
                >
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        <form
          className="sticky bottom-0 border-t border-gray bg-blue p-4 flex items-center gap-3"
          onSubmit={handleSend}
        >
          <input
            type="text"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-gray bg-black px-4 py-3 text-sm placeholder-gray focus:outline-none focus:ring-2 focus:ring-yellow focus:ring-offset-2"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-yellow px-4 py-3 text-sm font-semibold text-black shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                Sending...
              </>
            ) : (
              <span className="hidden sm:inline">Send</span>
            )}
          </button>
        </form>
      </section>
    </div>
  )
}

export default AskAi
