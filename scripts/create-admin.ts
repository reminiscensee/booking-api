import bcrypt from "bcryptjs";
import { pool } from "../src/db/pool.js";

try {
    const [email, password] = process.argv.slice(2);

    if (!email || !password) {
        console.error('Enter your email or password');
        process.exit(1);
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query('INSERT INTO admin_users(email, password_hash) VALUES ($1, $2)', [email, hashedPassword]);

    console.log('Admin created successfully');
} finally {
    await pool.end();
}


