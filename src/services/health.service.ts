export const getHealthStatus = () => ({ status: 'ok', timestamp: Date.now(), uptime: process.uptime() });
