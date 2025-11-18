import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // If already authenticated, redirect to dashboard after video plays for a bit
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* Full-screen Video Background */}
      <div className="video-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="landing-video"
          onLoadedData={() => setVideoLoaded(true)}
        >
          <source src="/main_screen_video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Dark Overlay for better text visibility */}
        <div className="video-overlay"></div>
      </div>

      {/* Content Overlay */}
      <div className={`landing-content ${videoLoaded ? 'fade-in' : ''}`}>
        <div className="landing-content-wrapper">
          {/* Main Heading */}
          <h1 className="landing-title">
            Formula 1 Data Management System
          </h1>

          {/* CTA Buttons */}
          <div className="landing-cta">
            <button 
              onClick={handleGetStarted}
              className="cta-primary"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              <span className="cta-arrow">→</span>
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
