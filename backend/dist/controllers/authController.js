import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { generateToken } from '../utils/auth.js';
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'STUDENT',
            },
        });
        const token = generateToken({ id: user.id, role: user.role });
        res.status(201).json({ token, user: { id: user.id, name: user.name, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken({ id: user.id, role: user.role });
        res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};
//# sourceMappingURL=authController.js.map