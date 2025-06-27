import { useState } from 'react'

function App() {
  const [movieTitle, setMovieTitle] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [sourceType, setSourceType] = useState('')
  const [sourceInput, setSourceInput] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!movieTitle.trim()) {
      setError('Please enter a movie title or genre')
      return
    }

    setLoading(true)
    setError('')
    setRecommendations([])
    setHasSearched(true)
    setSourceType('')
    setSourceInput('')

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/recommend?title=${encodeURIComponent(movieTitle.trim())}`
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Movie or genre not found')
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.')
        } else {
          throw new Error('Something went wrong')
        }
      }

      const data = await response.json()

      if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        setRecommendations(data.recommendations.slice(0, 5))
        setSourceType(data.type)
        setSourceInput(data.input)
      } else {
        setError('No recommendations found for this input')
      }
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to connect to the server. Please make sure the API is running.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setMovieTitle(e.target.value)
    if (error && e.target.value.trim()) {
      setError('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            🎬 Movie Recommender
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover your next favorite movie! Enter a movie title you love, 
            or a genre you enjoy, and we'll suggest great options for you.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="movieTitle" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Movie Title or Genre
              </label>
              <input
                type="text"
                id="movieTitle"
                value={movieTitle}
                onChange={handleInputChange}
                placeholder="e.g., The Dark Knight, Inception, Comedy, Drama..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !movieTitle.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Fetching recommendations...</span>
                </>
              ) : (
                <span>Get Recommendations</span>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Recommended Movies
            </h2>
            {sourceType && sourceInput && (
              <p className="text-center text-gray-500 mb-6">
                Based on {sourceType === 'title' ? 'movie' : 'genre'}: <strong>{sourceInput}</strong>
              </p>
            )}
            <div className="space-y-4">
              {recommendations.map((movie, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {movie.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {movie.genres}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {hasSearched && !loading && !error && recommendations.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-yellow-600 mb-2">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.09M6.343 6.343A8.014 8.014 0 0112 3a8.014 8.014 0 015.657 3.343M6.343 6.343L17.657 17.657" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-1">No recommendations found</h3>
            <p className="text-yellow-700">Try searching for a different movie title or genre.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by machine learning recommendations</p>
        </div>
      </div>
    </div>
  )
}

export default App
