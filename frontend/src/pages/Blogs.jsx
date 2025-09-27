import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL

// CSS animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }

  @keyframes glow {
    0% { opacity: 0.5; }
    50% { opacity: 1; }
    100% { opacity: 0.5; }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }

  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }

  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out;
  }
`

const Blogs = () => {
  const [blogs, setBlogs] = useState([])
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBlog, setNewBlog] = useState({ title: '', content: '' })
  const [creating, setCreating] = useState(false)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)
  
  const token = localStorage.getItem('token')

  // Fetch all blogs with comment counts
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/blogs/allblogs`)
        const data = await response.json()
        setBlogs(data)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  // Function to truncate content for preview
  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const handleCreateBlog = async (e) => {
    e.preventDefault()
    if (!newBlog.title.trim() || !newBlog.content.trim()) return

    setCreating(true)
    try {
      const response = await fetch(`${API_BASE}/api/blogs/newblog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token
        },
        body: JSON.stringify(newBlog)
      })

      if (response.ok) {
        const data = await response.json()
        setBlogs(prev => [data.blog, ...prev])
        setNewBlog({ title: '', content: '' })
        setShowCreateModal(false)
      }
    } catch (error) {
      console.error('Error creating blog:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-950 text-white">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
          <div className="text-center sm:text-left relative">
            <div className="relative z-10">
              <div className="inline-block">
                <span className="text-sm font-semibold text-yellow-400 tracking-wider uppercase mb-2 block animate-pulse">
                  Welcome to Our
                </span>
                <h1 className="text-6xl md:text-7xl font-extrabold mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow via-yellow-400 to-yellow pb-2 inline-block">
                    Community
                  </span>
                  <br className="md:hidden" />
                  <span className="text-white relative inline-block ml-2">
                    Blogs
                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-yellow to-transparent"></span>
                  </span>
                </h1>
              </div>
              <p className="text-gray-400 text-lg max-w-2xl mt-4 leading-relaxed">
                Explore insights and experiences shared by our community — where every story matters and every voice is heard
              </p>
              
              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-yellow/5 rounded-full blur-3xl"></div>
            </div>
            
            {/* Animated Dots */}
            <div className="absolute top-0 right-0 grid grid-cols-3 gap-2 opacity-20">
              {[...Array(9)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 rounded-full bg-yellow"
                  style={{
                    animation: `scaleIn 1s ease-in-out ${i * 0.1}s infinite alternate`
                  }}
                ></div>
              ))}
            </div>
          </div>
          {token && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="group bg-gradient-to-r from-yellow to-yellow-400 text-black px-8 py-4 rounded-xl font-bold 
                hover:shadow-lg hover:shadow-yellow/20 active:scale-95 transform transition-all duration-200 
                flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Blog
            </button>
          )}
        </div>
      
        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div 
              key={blog.id}
              onClick={async () => {
                setSelectedBlog(blog)
                setComments([]) // Clear existing comments
                try {
                  const response = await fetch(`${API_BASE}/api/blogs/${blog.id}/comments`)
                  if (response.ok) {
                    const data = await response.json()
                    setComments(data)
                  } else {
                    console.error('Failed to fetch comments')
                  }
                } catch (error) {
                  console.error('Error fetching comments:', error)
                }
              }}
              className="group bg-blue-900/40 backdrop-blur-sm p-8 rounded-2xl border border-gray/20 
                hover:border-yellow/50 transition-all duration-300 cursor-pointer 
                hover:shadow-lg hover:shadow-yellow/10 transform hover:-translate-y-1"
            >
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-bold text-yellow mb-4 group-hover:text-yellow-400 transition-colors">
                  {blog.title}
                </h2>
                <p className="text-gray-300 flex-grow mb-6 line-clamp-3">
                  {truncateContent(blog.content)}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray/20">
                  <p className="text-sm text-gray-400">
                    {new Date(blog.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <span className="text-yellow opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Read More →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blog Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div 
            className="bg-gradient-to-b from-blue-900 to-black p-8 rounded-2xl max-w-3xl w-full max-h-[85vh] 
              overflow-y-auto relative border border-gray/20 shadow-xl backdrop-blur-sm
              transform transition-all duration-300 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBlog(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full
                bg-gray-800 text-yellow hover:bg-yellow hover:text-black transition-all duration-200"
            >
              ×
            </button>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow to-yellow-400 mb-6">
              {selectedBlog.title}
            </h2>
            <div className="prose prose-lg prose-invert max-w-none">
              {selectedBlog.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-6 text-gray-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray/20 text-sm text-gray-400 flex items-center justify-between">
              <span>
                Posted on {new Date(selectedBlog.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <button
                onClick={() => setSelectedBlog(null)}
                className="text-yellow hover:text-yellow-400 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-8 pt-6 border-t border-gray/20">
              <h3 className="text-xl font-bold text-yellow mb-6">Comments</h3>
              
              {/* Add Comment Form */}
              {token && (
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!newComment.trim()) return

                    setAddingComment(true)
                    try {
                      const response = await fetch(`${API_BASE}/api/blogs/comment/${selectedBlog.id}`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          token
                        },
                        body: JSON.stringify({ content: newComment })
                      })

                      if (response.ok) {
                        const data = await response.json()
                        setComments(prev => [data.comment, ...prev])
                        setNewComment('')
                      }
                    } catch (error) {
                      console.error('Error adding comment:', error)
                    } finally {
                      setAddingComment(false)
                    }
                  }}
                  className="mb-6"
                >
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 rounded-xl border border-gray/20 bg-black/50 backdrop-blur-sm px-4 py-3 
                        text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow/50 
                        hover:border-gray/40 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={addingComment || !newComment.trim()}
                      className="bg-gradient-to-r from-yellow to-yellow-400 text-black px-6 py-3 rounded-xl font-bold 
                        hover:shadow-lg hover:shadow-yellow/20 active:scale-95 transform transition-all duration-200 
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                        flex items-center gap-2"
                    >
                      {addingComment ? (
                        <>
                          <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                          Posting...
                        </>
                      ) : (
                        'Post'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className="bg-black/30 rounded-xl p-4 backdrop-blur-sm border border-gray/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-400 font-medium">
                          {comment.commenter_name}
                        </span>
                        <span className="text-sm text-gray-400">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-300">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center italic">No comments yet</p>
                )}
              </div>
            </div>
          </div>
          <div 
            className="absolute inset-0 -z-10"
            onClick={() => setSelectedBlog(null)}
          ></div>
        </div>
      )}

      {/* Create Blog Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div 
            className="bg-gradient-to-b from-blue-900 to-black p-8 rounded-2xl max-w-2xl w-full relative
              border border-gray/20 shadow-xl backdrop-blur-sm transform transition-all duration-300 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full
                bg-gray-800 text-yellow hover:bg-yellow hover:text-black transition-all duration-200"
            >
              ×
            </button>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow to-yellow-400 mb-8">
              Create New Blog
            </h2>
            
            <form onSubmit={handleCreateBlog} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Title
                </label>
                <input
                  type="text"
                  value={newBlog.title}
                  onChange={(e) => setNewBlog(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your blog title"
                  className="w-full rounded-xl border border-gray/20 bg-black/50 backdrop-blur-sm px-4 py-3 
                    text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow/50 
                    hover:border-gray/40 transition-colors"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Content
                </label>
                <textarea
                  value={newBlog.content}
                  onChange={(e) => setNewBlog(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your blog content..."
                  className="w-full h-64 rounded-xl border border-gray/20 bg-black/50 backdrop-blur-sm px-4 py-3 
                    text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow/50 
                    hover:border-gray/40 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-gradient-to-r from-yellow to-yellow-400 text-black p-4 rounded-xl font-bold 
                  hover:shadow-lg hover:shadow-yellow/20 active:scale-95 transform transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    Creating...
                  </>
                ) : (
                  'Create Blog'
                )}
              </button>
            </form>
          </div>
          <div 
            className="absolute inset-0 -z-10"
            onClick={() => setShowCreateModal(false)}
          ></div>
        </div>
      )}
    </div>
  )
}

export default Blogs
