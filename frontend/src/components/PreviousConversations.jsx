"use client"

import { useEffect, useState } from "react"

const PreviousConversations = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/chat/previous-conversations", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        })

        const data = await res.json()
        if (res.ok) {
          setConversations(data.conversations || [])
        } else {
          console.error("Error:", data.message)
        }
      } catch (err) {
        console.error("Error fetching conversations:", err)
      }
    }

    fetchConversations()
  }, [])

  return (
    <div className="w-64 h-full p-4 space-y-3 overflow-y-auto bg-blue text-white">
      <h2 className="text-lg font-bold mb-4 text-yellow">Previous Chats</h2>
      {conversations.length > 0 ? (
        conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv)}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-yellow hover:text-black transition-all"
          >
            {conv.title || "Untitled Conversation"}
          </button>
        ))
      ) : (
        <p className="text-sm text-gray">No previous chats</p>
      )}
    </div>
  )
}

export default PreviousConversations
