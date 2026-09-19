import React, { useState, useEffect } from 'react'

function App() {
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')

  useEffect(() => {
    // Simulate checking API connection
    const checkApi = async () => {
      try {
        // In a real app, we would call the backend health endpoint
        // For now, we'll simulate a delay and set to connected
        await new Promise(resolve => setTimeout(resolve, 1000))
        setApiStatus('connected')
      } catch (error) {
        setApiStatus('disconnected')
      }
    }

    checkApi()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        NexTrade
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Plateforme Import-Export & Commerce
      </p>
      <div className="bg-white rounded-lg shadow-md w-full max-w-xs p-6">
        <h2 className="text-xl font-semibold mb-4">Frontend Status</h2>
        <p className="mb-2">React + TypeScript + Tailwind CSS: <span className="font-semibold">OK</span></p>
        <h2 className="text-xl font-semibold mb-4 mt-4">API Connection</h2>
        <p className="mb-2">
          Status: <span className={apiStatus === 'connected' ? 'text-green-600 font-semibold' : apiStatus === 'disconnected' ? 'text-red-600 font-semibold' : 'text-yellow-600 font-semibold'}>
            {apiStatus === 'checking' ? 'Checking...' : apiStatus === 'connected' ? 'Connected' : 'Disconnected'}
          </span>
        </p>
      </div>
    </div>
  )
}

export default App