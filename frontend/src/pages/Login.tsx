import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Lock, User } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const params = new URLSearchParams()
      params.append('username', username)
      params.append('password', password)
      
      const { data } = await axios.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      
      localStorage.setItem('token', data.access_token)
      navigate('/')
    } catch (err) {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white/[0.02] border border-white/[0.05] rounded-xl backdrop-blur-md overflow-hidden p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white">Kalvron Admin</h2>
          <p className="text-gray-400 mt-2 text-sm">Sign in to access the dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg text-sm text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5 pl-10 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-gray-600 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5 pl-10 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-gray-600 transition-colors"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center min-h-[44px]"
          >
            {loading ? (
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
