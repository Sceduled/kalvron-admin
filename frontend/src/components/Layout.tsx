import { Outlet, Navigate, useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard } from 'lucide-react'

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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <LayoutDashboard className="w-6 h-6 text-emerald-500" />
            <h1 className="text-xl font-bold tracking-tight">Kalvron Admin</h1>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
