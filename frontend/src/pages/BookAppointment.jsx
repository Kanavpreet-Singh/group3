import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL

const BookAppointment = () => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [counselors, setCounselors] = useState(null)
  const [error, setError] = useState(null)
  const [allCounselors, setAllCounselors] = useState([])
  const [aiResponse, setAiResponse] = useState('')
  
  // Fetch all counselors when component mounts
  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/users/counselors`)
        if (!response.ok) throw new Error('Failed to fetch counselors')
        const data = await response.json()
        setAllCounselors(data)
      } catch (err) {
        console.error('Error fetching counselors:', err)
        setError('Failed to load counselors. Please try again later.')
      }
    }
    fetchCounselors()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Enhanced query validation
    if (query.trim().length < 20) {
      setError("Please provide more details about your concerns (at least 20 characters) to help us match you with the right counselor.")
      return
    }

    setLoading(true)
    setError(null)
    setCounselors(null)
    setAiResponse('')

    try {
      // Call the AI matching API
      const response = await fetch('http://127.0.0.1:5001/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          doctors: allCounselors.map(counselor => ({
            "User ID": counselor.user_id,
            "Name": counselor.name,
            "Specialization": counselor.specialization,
            "Bio": counselor.bio,
            "Experience": counselor.years_of_experience
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to process your query')
      
      const data = await response.json()
      
      // Validate AI response
      if (!data.answer || !data.user_ids) {
        throw new Error('Invalid response from AI service')
      }

      setAiResponse(data.answer)

      if (data.user_ids && data.user_ids.length > 0) {
        // Filter counselors based on returned user_ids
        const matchedCounselors = allCounselors.filter(counselor => 
          data.user_ids.includes(counselor.user_id)
        )
        
        // Only show counselors if we have actual matches
        if (matchedCounselors.length > 0) {
          setCounselors(matchedCounselors)
        } else {
          setError("Based on your description, we couldn't find an exact match. Please try describing your needs differently.")
        }
      } else {
        setError("We need more specific information about your concerns to match you with the right counselor. Please provide details about what you're looking for in a counselor.")
      }
    } catch (err) {
      console.error('Error:', err)
      setError("Failed to process your request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow mb-4">Book an Appointment</h1>
        <p className="text-gray text-lg">Tell us about your concerns, and we'll match you with the right counselor.</p>
      </div>

      {/* Query Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-12">
        <div className="bg-blue rounded-2xl p-6 shadow-lg">
          <label htmlFor="query" className="block text-lg font-medium mb-3 text-yellow">
            What brings you here today?
          </label>
          <textarea
            id="query"
            rows="4"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Please describe your concerns or what you'd like to discuss with a counselor..."
            className="w-full rounded-xl bg-black border border-gray p-4 text-white placeholder-gray focus:ring-2 focus:ring-yellow focus:border-transparent transition duration-200"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="mt-4 w-full md:w-auto bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl px-8 py-3 font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Finding Counselors...
              </>
            ) : (
              "Find Counselors"
            )}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto mb-8 bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* AI Response */}
      {aiResponse && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-blue/50 rounded-2xl p-6 border border-gray">
            <h3 className="text-lg font-semibold text-yellow mb-2">AI Recommendation</h3>
            <p className="text-gray-300">{aiResponse}</p>
          </div>
        </div>
      )}

      {/* Counselors List */}
      {counselors && counselors.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-yellow">Recommended Counselors</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {counselors.map((counselor) => (
              <div key={counselor.user_id} className="bg-blue rounded-2xl p-6 border border-gray hover:border-yellow transition duration-200">
                <h3 className="text-xl font-semibold mb-2">{counselor.name}</h3>
                <p className="text-yellow mb-2">{counselor.specialization}</p>
                <p className="text-sm text-gray mb-4">{counselor.bio}</p>
                <div className="flex items-center text-sm">
                  <span className="text-gray">Experience: {counselor.years_of_experience} years</span>
                </div>
                <button 
                  onClick={() => alert('Booking functionality coming soon!')}
                  className="mt-4 w-full bg-yellow text-black rounded-xl px-4 py-2 font-semibold hover:opacity-90 transition duration-200"
                >
                  Schedule Session
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BookAppointment
