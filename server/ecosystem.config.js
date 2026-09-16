module.exports = {
  apps: [{
    name: 'lara-server',
    script: 'dist/index.js',
    env: {
      NODE_ENV: 'development',
      PORT: 3001,
      SUPABASE_URL: 'https://lnbzbearlghucuftyncd.supabase.co',
      FRONTEND_URL: 'https://lara-croft.vercel.app'
    }
  }]
};
