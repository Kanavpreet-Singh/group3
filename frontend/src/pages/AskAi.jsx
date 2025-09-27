import { useState, useContext, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import PreviousConversations from "../components/PreviousConversations"

const AskAi = () => {
  const { currentUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! I'm CalmConnect AI. How can I help you today?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const prevMessagesLength = useRef(messages.length)

  // Scroll messages container when new message arrives and user is near bottom
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    if (messages.length > prevMessagesLength.current && isNearBottom) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
    }

    prevMessagesLength.current = messages.length
  }, [messages])

  // Check JWT token on load
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/signin")
    }
  }, [navigate])

  const fetchAIResponse = async (userMessage) => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const aiResponse = `You said: "${userMessage}". I'm here to support you and provide guidance. How else can I assist you today?`
      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }])
    } catch {
      setMessages((prev) => [...prev, { sender: "ai", text: "Sorry, something went wrong. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMessage = input.trim()
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }])
    setInput("")
    await fetchAIResponse(userMessage)
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-80 border-r border-gray bg-blue">
        <PreviousConversations onSelectConversation={setSelectedConversation} />
      </aside>

      {/* Mobile Sidebar Overlay */}
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
              onSelectConversation={(conv) => {
                setSelectedConversation(conv)
                setSidebarOpen(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Main Chat Section */}
      <section className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-blue border-b border-gray p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-yellow">Ask AI</h1>
            <p className="text-sm text-gray mt-1">Get personalized support and guidance</p>
          </div>
          <button
            type="button"
            className="md:hidden inline-flex items-center gap-2 rounded-md border border-gray bg-blue px-3 py-2 text-sm hover:bg-yellow hover:text-black transition"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v2H4zM4 11h16v2H4zM4 16h10v2H4z" />
            </svg>
          </button>
        </header>

        {/* Messages */}
        <main
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {messages.map((msg, idx) => {
            const isUser = msg.sender === "user"
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div
                    className="h-8 w-8 shrink-0 rounded-full bg-yellow text-black grid place-items-center text-xs font-semibold"
                    title="CalmConnect AI"
                  >
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border ${
                    isUser ? "bg-yellow text-black border-transparent" : "bg-blue text-white border-gray"
                  }`}
                >
                  <div className="text-xs font-medium opacity-80 mb-1">
                    {isUser ? "You" : "CalmConnect AI"}
                  </div>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                {isUser && (
                  <div
                    className="h-8 w-8 shrink-0 rounded-full bg-gray text-black/80 grid place-items-center text-xs font-semibold"
                    title={currentUser?.name || "You"}
                  >
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </main>

        {/* Composer */}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
            </svg>
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </section>
    </div>
  )
}

export default AskAi
