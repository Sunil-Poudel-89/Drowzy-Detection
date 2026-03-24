import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import { Users, ShieldCheck, AlertTriangle, TrendingUp, Search, Eye, MapPin, Calendar, Clock, Image as ImageIcon } from "lucide-react"
import "./AdminPage.css"

function AdminPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [userData, setUserData] = useState([])
  const [todaysAlerts, setTodaysAlerts] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5001/get_all_users')
      .then(res => res.json())
      .then(data => {
         if(Array.isArray(data)) setUserData(data)
      })
      .catch(e => console.error(e))
      
    fetch('http://localhost:5001/get_todays_alerts')
      .then(res => res.json())
      .then(data => {
         if(Array.isArray(data)) setTodaysAlerts(data)
      })
      .catch(e => console.error(e))
  }, [])

  const filteredUsers = userData.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusClass = (status) => status === "Active" ? "badge-success" : "badge-secondary"
  const getAlertScoreClass = (score) => {
    if (score >= 90) return "text-success"
    if (score >= 80) return "text-warning"
    return "text-danger"
  }

  const fatigueByUser = [...userData].sort((a,b) => b.fatigueEvents - a.fatigueEvents).slice(0, 5).map(u => ({name: u.name, events: u.fatigueEvents}))
  const severityData = [
    { name: "Low", value: 45, color: "var(--success)" },
    { name: "Medium", value: 30, color: "var(--warning)" },
    { name: "High", value: 25, color: "var(--danger)" },
  ] // Can be mapped to live logic if needed

  return (
    <div className="admin-page">
      <Header showNavigation={false} />

      <main className="container main-content animate-fade-in">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Monitor and manage drivers and fatigue incidents across the network.</p>
          </div>
        </div>

        {/* Admin Stats */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card glass-panel animate-slide-up">
            <div className="stat-header">
              <span className="stat-title">Total Users</span>
              <Users className="stat-icon text-primary" size={20} />
            </div>
            <div className="stat-value">{userData.length}</div>
            <p className="stat-trend text-primary">Fleet Scale</p>
          </div>

          <div className="admin-stat-card glass-panel animate-slide-up delay-100">
            <div className="stat-header">
              <span className="stat-title">Active Drivers</span>
              <ShieldCheck className="stat-icon text-success" size={20} />
            </div>
            <div className="stat-value">
              {userData.filter((u) => u.status === "Active").length}
            </div>
            <p className="stat-trend text-success">Recently Monitored</p>
          </div>

          <div className="admin-stat-card glass-panel animate-slide-up delay-200">
            <div className="stat-header">
              <span className="stat-title">Critical Alerts Today</span>
              <AlertTriangle className="stat-icon text-danger" size={20} />
            </div>
            <div className="stat-value text-danger">
              {todaysAlerts.length}
            </div>
            <p className="stat-trend text-danger">Major Severity</p>
          </div>

          <div className="admin-stat-card glass-panel animate-slide-up delay-300">
            <div className="stat-header">
              <span className="stat-title">Avg Fleet Alertness</span>
              <TrendingUp className="stat-icon text-primary" size={20} />
            </div>
            <div className="stat-value">
              {userData.length > 0 ? Math.round(userData.reduce((sum, user) => sum + user.alertScore, 0) / userData.length) : 0}%
            </div>
            <p className="stat-trend text-primary">Network Stability</p>
          </div>
        </div>

        {/* Today's Critical Alerts Visual Array */}
        <div className="card glass-panel mt-6 animate-slide-up delay-100">
           <div className="card-header border-b border-glass pb-4">
             <h2 className="card-title text-danger flex items-center gap-2"><AlertTriangle size={20}/> Today's Critical Alerts</h2>
             <p className="card-description">Real-time major severity tracking across the fleet</p>
           </div>
           <div className="card-content pt-4 overflow-x-auto">
              {todaysAlerts.length === 0 ? (
                 <div className="text-secondary text-center py-8">No major incidents detected today across the fleet.</div>
              ) : (
                 <div className="flex gap-4 pb-4" style={{overflowX: 'auto'}}>
                    {todaysAlerts.map((alert, idx) => (
                       <div key={idx} className="glass-panel p-4 outline outline-1 outline-danger" style={{minWidth: '280px', borderRadius: '1rem'}}>
                          {alert.image_url ? (
                             <img src={`http://localhost:5001${alert.image_url}`} alt="Event" className="w-full h-32 object-cover rounded-md mb-3 border border-glass cursor-pointer hover:border-danger transition-all" onClick={() => setSelectedImage(`http://localhost:5001${alert.image_url}`)} />
                          ) : (
                             <div className="w-full h-32 flex items-center justify-center bg-black bg-opacity-40 rounded-md mb-3 text-secondary"><ImageIcon size={32}/></div>
                          )}
                          <h4 className="font-bold text-white mb-1">Driver: {alert.username}</h4>
                          <div className="text-sm text-secondary flex items-center gap-1 mb-1"><MapPin size={14}/> {alert.location?.lat.toFixed(4) || "N/A"}, {alert.location?.lng.toFixed(4) || "N/A"}</div>
                          <div className="text-sm text-secondary flex items-center gap-1 mb-3"><Clock size={14}/> {alert.start} ({alert.duration})</div>
                          <button onClick={() => navigate(`/dashboard?ride_id=${alert.ride_id}&driver=${alert.username}`)} className="btn btn-sm btn-outline btn-block text-danger border-danger hover:bg-danger hover:text-white transition-colors">
                             View Ride Session <Eye size={14} className="ml-1 inline"/>
                          </button>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

        <div className="admin-content-grid mt-6">
          {/* Fatigue Events by User */}
          <div className="card glass-panel chart-card animate-slide-up delay-200">
            <div className="card-header border-b border-glass pb-4">
              <h2 className="card-title">Event Frequency by Driver</h2>
              <p className="card-description">Number of fatigue events detected per user</p>
            </div>
            <div className="card-content pt-4">
              <div className="bar-chart-container">
                {fatigueByUser.map((u, idx) => (
                  <div key={idx} className="bar-row">
                    <div className="bar-label">{u.name}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${Math.min((u.events / 15) * 100, 100)}%` }}></div>
                    </div>
                    <div className="bar-value">{u.events}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Severity Distribution */}
          <div className="card glass-panel chart-card animate-slide-up delay-300">
            <div className="card-header border-b border-glass pb-4">
              <h2 className="card-title">Event Severity Distribution</h2>
              <p className="card-description">Breakdown of fatigue events by severity level</p>
            </div>
            <div className="card-content pt-4">
              <div className="pie-chart-list">
                {severityData.map((item, index) => (
                  <div key={index} className="pie-item glass-panel">
                    <div className="pie-color-indicator" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}` }}></div>
                    <span className="pie-label flex-1">{item.name} Severity</span>
                    <span className="pie-value font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card glass-panel mt-6 animate-slide-up delay-400">
          <div className="card-header flex-col md:flex-row border-b border-glass pb-4">
            <div>
              <h2 className="card-title flex items-center gap-2">
                <Users className="text-primary" size={20} />
                User Management
              </h2>
              <p className="card-description">Manage users and view their statistics</p>
            </div>
            <div className="search-box mt-4 md:mt-0">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input with-icon search-input"
              />
            </div>
          </div>
          <div className="card-content pt-4 overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Driver Details</th>
                  <th>Status</th>
                  <th>Events</th>
                  <th>Alertness Score</th>
                  <th>Sessions</th>
                  <th>Last Readout</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="table-row hover-bg">
                    <td>
                      <div className="driver-info">
                        <div className="driver-avatar">{u.name.charAt(0)}</div>
                        <div>
                          <div className="driver-name">{u.name}</div>
                          <div className="driver-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(u.status)}`}>{u.status}</span>
                    </td>
                    <td>
                      <div className="flex-center-gap">
                        <AlertTriangle size={16} className="text-warning" />
                        <span>{u.fatigueEvents}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`font-bold ${getAlertScoreClass(u.alertScore)}`}>
                        {u.alertScore}%
                      </span>
                    </td>
                    <td>
                      <div className="flex-center-gap text-secondary">
                        <span>{u.totalSessions}</span>
                      </div>
                    </td>
                    <td className="text-secondary text-sm">{u.lastSession}</td>
                    <td>
                      <button onClick={() => navigate(`/history?driver=${u.id}`)} className="btn btn-outline btn-sm action-btn">
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="empty-table text-center py-8 text-secondary">
                No users matched your search.
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedImage && (
        <div className="image-modal-overlay" onClick={() => setSelectedImage(null)} style={{zIndex: 9999}}>
          <button className="modal-close-btn" onClick={() => setSelectedImage(null)}>✕</button>
          <img src={selectedImage} alt="Event Fullscreen" className="image-modal-content" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default AdminPage
