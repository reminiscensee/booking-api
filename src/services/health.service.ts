import { pool } from "../db/pool.js";

export const getHealthStatus = () => ({ status: 'ok', timestamp: Date.now(), uptime: process.uptime() });


export async function getDbHealthStatus() {
    await pool.query('SELECT 1');
    return {status: 'ok', db: 'connected'};
}