export default function Health() {
  return (
    <div style={{ fontFamily: 'monospace', padding: '40px', background: '#1a1a1a', color: '#0f0', minHeight: '100vh' }}>
      <h1>LARA CROFT — Health Status</h1>
      <hr style={{ borderColor: '#333', margin: '20px 0' }} />
      <p>Frontend: <span style={{ color: '#0f0' }}>OK</span></p>
      <p>Backend: <a href="/api/health" style={{ color: '#0f0' }}>/api/health</a></p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}
