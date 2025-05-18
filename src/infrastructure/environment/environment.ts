export default () => ({
  NODE_ENV: process.env['NODE_ENV'],
  firebase: JSON.parse(process.env['FIREBASE'] || '{}') || {},
  server: {
    port: parseInt(process.env['SERVER_PORT'] || '3000', 10) || 3000,
    secret: process.env['SERVER_SECRET'] || 'Secret',
    hostName: process.env['SERVER_HOST_NAME'] || 'http://localhost:3000',
    isLocalhost: process.env['SERVER_IS_LOCALHOST'] || true,
    logger: process.env['SERVER_LOGGER']
      ? JSON.parse(`${process.env['SERVER_LOGGER']}`)
      : [],
  },
  database: {
    mongodb: {
      mainUri: process.env['MONGODB_URI'] || '',
    },
  },
  redis: {
    host: process.env['REDIS_HOST'] || '',
    port: process.env['REDIS_PORT'] || 14816,
    username: process.env['REDIS_USERNAME'] || 'default',
    password: process.env['REDIS_PASSWORD'] || 'password',
  },
});
