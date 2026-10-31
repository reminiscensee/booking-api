import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { AppError } from "../errors/app.error.js";
import type { loginSchemaInput } from "../schemas/auth.schema.js";
import jwt from 'jsonwebtoken'
import { env } from "../config/env.js"

export async function loginAdmin(data: loginSchemaInput) {
    const result = await pool.query('SELECT * FROM admin_users WHERE email = $1', [data.email]);
    const admin = result.rows[0];
    if(!admin) {
        throw new AppError('Invalid email or password', 401);
    };
    const isMatch = await bcrypt.compare(data.password, admin.password_hash);
    if(!isMatch) {
        throw new AppError('Invalid email or password', 401);
    };
    const token = jwt.sign({id: admin.id}, env.JWT_SECRET, {expiresIn: '1d'});
    return { token };
}