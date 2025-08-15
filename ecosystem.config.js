module.exports = {
  apps: [
    {
      name: 'ja-cms',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/ja-cms',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  ]
};
