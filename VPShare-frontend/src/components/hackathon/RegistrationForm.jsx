import React from 'react';
import '../../styles/Hackathon.css';

const RegistrationForm = () => (
  <div className="registration-container">
    <div
      className="registration-closed-banner"
      style={{
        margin: '60px auto',
        maxWidth: 550,
        background: 'linear-gradient(135deg, #6366f1 0%, #2563eb 100%)',
        color: 'white',
        borderRadius: 16,
        padding: '48px 32px',
        textAlign: 'center',
        boxShadow: '0 6px 24px 0 rgba(36, 69, 146, 0.09)',
        border: '1.5px solid #4755be',
      }}
    >
      <div
        style={{
          fontSize: '3.5rem',
          marginBottom: 24,
          filter: 'drop-shadow(0 2px 10px #181c4c40)',
        }}
      >
        🚫
      </div>
      <h2
        style={{
          marginBottom: 18,
          fontWeight: 800,
          letterSpacing: '-1.5px',
          fontSize: '2.2rem',
        }}
      >
        Registrations are over
      </h2>
      <p
        style={{
          fontSize: '1.25rem',
          margin: '0 0 12px 0',
          fontWeight: 500,
          opacity: 0.94,
        }}
      >
        Thank you for your interest in the CognitiveX GenAI Hackathon.<br />
        Stay tuned for updates and future events!
      </p>
    </div>
  </div>
);

export default RegistrationForm;