module.exports = {
  apps: [{
    name: 'varmasite',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/varmasite',
    instances: 1, // Single instance for t3.micro (1GB RAM)
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    max_memory_restart: '800M',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: '/var/log/pm2/varmasite-error.log',
    out_file: '/var/log/pm2/varmasite-out.log',
    merge_logs: true,
    autorestart: true,
    watch: false,
  }],
}
