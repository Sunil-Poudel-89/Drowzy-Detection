import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Camera, StopCircle, Focus, Info } from "lucide-react"
import "./CameraFeed.css"

const BACKEND_URL = "http://127.0.0.1:5001"

function CameraFeed({ rideId, onEndRide }) {
  const { user } = useAuth()
  const [cameraOn, setCameraOn] = useState(false)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState({ lat: null, lng: null })

  const username = user?.name || "guest"

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setCameraOn(true)
          setError(null)
        },
        (err) => {
          console.warn("Location error:", err)
          setCameraOn(true)
          setError("Location access denied. GPS tracking disabled.")
        }
      )
    } else {
      setCameraOn(true)
      setError(null)
    }
  }

  const stopCamera = () => {
    setCameraOn(false)
    fetch(`${BACKEND_URL}/stop_camera`, { method: "POST" }).catch(() => {})
  }

  return (
    <div className="camera-feed glass-panel">
      <div className="camera-header">
        <h3 className="camera-title flex items-center gap-2">
          <Focus className={cameraOn ? "text-danger animate-pulse" : "text-primary"} size={20} />
          AI Vision Hub
        </h3>
        {cameraOn && (
          <div className="live-status-badge">
            <span className="live-dot"></span> LIVE
          </div>
        )}
      </div>

      <div className="camera-content">
        {error && (
          <div className="camera-error">
            <Info size={18} />
            {error}
          </div>
        )}

        <div className={`video-container ${cameraOn ? "active" : ""}`}>
          {cameraOn ? (
            <>
              <img
                src={`${BACKEND_URL}/video_feed?username=${username}&ride_id=${rideId}${location.lat ? `&lat=${location.lat}&lng=${location.lng}` : ''}`}
                alt="Drowsiness Detection Stream"
                className="video-element"
                onError={() => setError("Unable to load camera stream")}
              />
              <div className="scanning-overlay"></div>
              <div className="crosshair crosshair-tl"></div>
              <div className="crosshair crosshair-tr"></div>
              <div className="crosshair crosshair-bl"></div>
              <div className="crosshair crosshair-br"></div>
            </>
          ) : (
            <div className="camera-standby">
              <div className="camera-icon-wrapper pulse-glow">
                <Camera size={48} className="text-secondary" />
              </div>
              <h4 className="standby-title">System Standby</h4>
              <p className="standby-text">Initialize visual monitoring to start detecting fatigue.</p>
            </div>
          )}
        </div>

        <div className="camera-actions" style={{display: 'flex', gap: '1rem'}}>
          <button
            onClick={cameraOn ? stopCamera : startCamera}
            className={`btn flex-1 ${cameraOn ? "btn-outline" : "btn-primary"}`}
          >
            {cameraOn ? (
              <><StopCircle size={18} /> Pause Feed</>
            ) : (
              <><Focus size={18} /> Initialize Feed</>
            )}
          </button>

          <button onClick={onEndRide} className="btn btn-destructive flex-1">
             <StopCircle size={18} /> End Ride
          </button>
        </div>

        <div className="camera-metadata">
          <div className="meta-item">
             <span className="meta-label">Engine</span>
             <span className="meta-value">MediaPipe / TF</span>
          </div>
          <div className="meta-item">
             <span className="meta-label">Metrics</span>
             <span className="meta-value">EAR / MAR Tracking</span>
          </div>
          <div className="meta-item">
             <span className="meta-label">Logging</span>
             <span className="meta-value">Encrypted Database</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CameraFeed
