module.exports = {
  apps: [
    {
      name: 'mastero-api',
      script: 'dist/src/main.js',
      cwd: '/var/www/mastero/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
