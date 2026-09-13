// PM2 process definition. Start with:  pm2 start deploy/ecosystem.config.js
// Single instance on purpose: this VPS has one core and 1 GB of RAM, and the
// app's hold-expiry and webhook handling are safe in one process.
module.exports = {
  apps: [
    {
      name: 'eldava',
      cwd: '/var/www/eldava',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: '3000' },
      // Restart if the process leaks past this; well under the box's 1 GB.
      max_memory_restart: '600M',
      autorestart: true,
      time: true,
      out_file: '/home/eldava/.pm2/logs/eldava-out.log',
      error_file: '/home/eldava/.pm2/logs/eldava-error.log',
    },
  ],
};
