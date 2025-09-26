"use client"

import { useState } from "react"

const AskAi = () => {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi! I'm CalmConnect AI. How can I help you today?" },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchAIResponse = async (userMessage) => {
    setLoading(true)

    try {
      // Dummy delay + response (replace with your API fetch call)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const aiResponse = `You said: "${userMessage}". I'm here to support you and provide guidance. How else can I assist you today?`

      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }])
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "ai", text: "Sorry, something went wrong. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }])
    setInput("")

    // Call AI
    await fetchAIResponse(userMessage)
  }

  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: "var(--color-black)", color: "var(--color-white)" }}
    >
      {/* Chat Header */}
      <div className="p-4 shadow-lg" style={{ backgroundColor: "var(--color-blue)" }}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-yellow)" }}>
          Ask AI
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-gray)" }}>
          Get personalized support and guidance
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-lg px-4 py-3 rounded-lg shadow-sm ${msg.sender === "user" ? "ml-auto" : "mr-auto"}`}
            style={{
              backgroundColor: msg.sender === "user" ? "var(--color-yellow)" : "var(--color-blue)",
              color: msg.sender === "user" ? "var(--color-black)" : "var(--color-white)",
            }}
          >
            <div className="text-sm font-medium mb-1">{msg.sender === "user" ? "You" : "CalmConnect AI"}</div>
            <div>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div
            className="mr-auto px-4 py-3 rounded-lg animate-pulse"
            style={{ backgroundColor: "var(--color-blue)", color: "var(--color-gray)" }}
          >
            <div className="text-sm font-medium mb-1">CalmConnect AI</div>
            <div className="flex items-center space-x-1">
              <div
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: "var(--color-yellow)" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: "var(--color-yellow)", animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ backgroundColor: "var(--color-yellow)", animationDelay: "0.2s" }}
              ></div>
              <span className="ml-2">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t flex items-center space-x-3"
        style={{ backgroundColor: "var(--color-blue)", borderColor: "var(--color-gray)" }}
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: "var(--color-black)",
            color: "var(--color-white)",
            borderColor: "var(--color-gray)",
            "--tw-ring-color": "var(--color-yellow)",
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--color-yellow)",
            color: "var(--color-black)",
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default AskAi
