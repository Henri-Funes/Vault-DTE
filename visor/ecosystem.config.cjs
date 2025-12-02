// Configuración de PM2 para Windows Server
module.exports = {
  apps: [
    {
      name: 'visor-backup',
      script: './server/index.js',
      cwd: __dirname, // Directorio actual del proyecto
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      merge_logs: true,
    },
  ],
}
