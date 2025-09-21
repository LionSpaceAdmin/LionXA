import React from 'react';
import './index.css'; // Assuming you have some basic styles

function App() {

  const handleProofClick = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/agent/prove_connection', { method: 'POST' });
      if (response.ok) {
        alert('Screenshot command sent! A new "logs" directory should appear in your project with the proof.png file shortly.');
      } else {
        const error = await response.json();
        alert(`Failed to send screenshot command: ${error.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to send proof command:', error);
      alert('Failed to send screenshot command. Is the backend running?');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '1rem' }}>
      <h1>X-Agent Control Panel</h1>
      <p>Use the button below to verify end-to-end connectivity to the browser agent.</p>
      <button 
        onClick={handleProofClick} 
        style={{
          margin: '20px 0',
          padding: '12px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        Prove Connection (Take Agent Screenshot)
      </button>
      <hr />
      <h2>Agent Visual Output</h2>
      <p>Log in to Guacamole below (user: <strong>xagent-admin</strong>, pass: <strong>password</strong>) to see the agent's desktop.</p>
      <iframe 
        src="http://localhost:8081/"
        title="Browser Agent"
        style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}
      />
    </div>
  );
}

export default App;