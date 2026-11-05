import { pool } from "../db/pool.js";
import { AppError } from "../errors/app.error.js";
import type { CreateServiceInput, UpdateServiceInput } from "../schemas/service.schema.js";

export async function findAllActiveServices() {
    const result = await pool.query("SELECT * FROM services WHERE is_active = TRUE ORDER BY id ASC");
    
    return result.rows;
};
export async function findServiceById(id: number) {
    const query = "SELECT * FROM services WHERE id = $1 AND is_active = TRUE"    
    const values = [id];

    const result = await pool.query(query, values);
    if(!result.rows[0]) {
        throw new AppError('Service not found', 404);
    }
    return result.rows[0];
};
export async function createService(data: CreateServiceInput) {
    const query = "INSERT INTO services (name, price, description) VALUES ($1, $2, $3) RETURNING *";
    const values = [data.name, data.price, data.description ?? null];

    const result = await pool.query(query, values);
    const newService = result.rows[0];

    return newService
};
export async function updateService(id: number, data: UpdateServiceInput) {
    const keys = ['name', 'price', 'description', 'is_active']
    const filteredKeys = Object.keys(data).filter((key) => keys.includes(key));
    if(filteredKeys.length === 0) {
        throw new AppError('No valid fields to update', 400)
    }
    const setClause = filteredKeys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const query = `UPDATE services SET ${setClause} WHERE id = $${filteredKeys.length + 1} RETURNING *`;
    const values = [...filteredKeys.map((key) => (data as Record<string, unknown>)[key]), id];

    const result = await pool.query(query, values);
    if(!result.rows[0]) {
        throw new AppError('Service not found', 404)
    }
    return result.rows[0]
};
export async function getAllServicesAdmin() {
    const query = await pool.query('SELECT * FROM services ORDER BY id ASC');

    const result = query.rows;

    return result;
};