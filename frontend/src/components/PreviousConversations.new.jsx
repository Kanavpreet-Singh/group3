"use client"

const PreviousConversations = ({ 
  conversations = [], 
  onSelectConversation, 
  onDeleteConversation,
  currentConversationId 
}) => {
  return (
    <div className="w-64 h-full p-4 space-y-3 bg-blue text-white overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20">
      <h2 className="text-lg font-bold mb-4 text-yellow sticky top-0 bg-blue z-10 pb-2">Previous Chats</h2>
      {conversations.length > 0 ? (
        conversations.map((conv) => (
          <div key={conv.id} className="flex items-center gap-2 mb-2">
            <button
              onClick={() => onSelectConversation(conv)}
              className={`flex-1 text-left px-3 py-2 rounded-lg transition-all ${
                currentConversationId === conv.id 
                  ? 'bg-yellow/10 text-yellow border border-yellow/30' 
                  : 'hover:bg-yellow hover:text-black'
              }`}
            >
              {conv.title || "Untitled Conversation"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conv.id);
              }}
              className="px-3 py-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all text-xl font-bold"
              title="Delete conversation"
            >
              ×
            </button>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray">No previous chats</p>
      )}
    </div>
  )
}

export default PreviousConversations