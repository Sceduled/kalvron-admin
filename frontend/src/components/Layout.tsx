import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Layout() {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 flex flex-col font-sans">
      <header className="border-b border-white/[0.05] bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <LayoutDashboard className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold tracking-tight text-white">Kalvron Admin</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm bg-white/[0.03] text-gray-300 border border-white/[0.05] hover:bg-white/[0.05] transition-all px-4 py-2 rounded-lg"
          >
            <LogOut size={16} className="text-gray-400" />
            Logout
          </button>
        </div>
      </header>
      <motion.main 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3 }}
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <Outlet />
      </motion.main>
    </div>
  )
}
