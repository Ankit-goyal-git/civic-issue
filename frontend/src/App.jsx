import { useState } from 'react'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <div className="app">
      {/* Navigation Header */}
      <header className="header">
        <div className="container">
          <h1>🏆 Civic Issue Tracker</h1>
          <nav className="nav">
            <button 
              className={currentPage === 'home' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentPage('home')}
            >
              Home
            </button>
            <button 
              className={currentPage === 'report' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentPage('report')}
            >
              Report Issue
            </button>
            <button 
              className={currentPage === 'track' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentPage('track')}
            >
              Track Reports
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="container">
          {currentPage === 'home' && (
            <div className="home-page">
              <h2>Welcome to Civic Issue Tracker</h2>
              <p>Help make your community better by reporting issues like:</p>
              <ul className="issue-types">
                <li>🕳️ Potholes</li>
                <li>💡 Broken Streetlights</li>
                <li>🗑️ Overflowing Trash Bins</li>
                <li>🚧 Road Damage</li>
                <li>🌊 Water Leaks</li>
              </ul>
              <div className="cta-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={() => setCurrentPage('report')}
                >
                  Report an Issue
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage('track')}
                >
                  Track Your Reports
                </button>
              </div>
            </div>
          )}

          {currentPage === 'report' && (
            <div className="report-page">
              <h2>Report a Civic Issue</h2>
              <p>Help us identify and fix problems in your community</p>
              <div className="coming-soon">
                <p>🚧 Report form coming soon!</p>
                <p>This will include:</p>
                <ul>
                  <li>Issue type selection</li>
                  <li>Photo upload</li>
                  <li>Location picker</li>
                  <li>Description field</li>
                </ul>
              </div>
            </div>
          )}

          {currentPage === 'track' && (
            <div className="track-page">
              <h2>Track Your Reports</h2>
              <p>See the status of your submitted reports</p>
              <div className="coming-soon">
                <p>🚧 Tracking system coming soon!</p>
                <p>This will show:</p>
                <ul>
                  <li>Your submitted reports</li>
                  <li>Current status (Pending, In Progress, Resolved)</li>
                  <li>Updates from city staff</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
