import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/prisma.js';
import { generateToken } from '../utils/auth.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
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
                lastLogin: new Date(),
                currentStreak: 1,
                longestStreak: 1
            },
        });

        const token = generateToken({ id: user.id, role: user.role });
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, currentStreak: user.currentStreak, longestStreak: user.longestStreak } });
    } catch (error: any) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
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

        // --- STREAK LOGIC ---
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let newStreak = user.currentStreak || 0;
        let newLongest = user.longestStreak || 0;

        if (user.lastLogin) {
            const lastLoginDate = new Date(user.lastLogin);
            const lastLoginDay = new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate());
            const diffTime = Math.abs(today.getTime() - lastLoginDay.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) newStreak += 1;
            else if (diffDays > 1) newStreak = 1;
        } else {
            newStreak = 1;
        }

        if (newStreak > newLongest) newLongest = newStreak;

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: now, currentStreak: newStreak, longestStreak: newLongest }
        });

        const token = generateToken({ id: user.id, role: user.role });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, currentStreak: newStreak, longestStreak: newLongest } });
    } catch (error: any) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

// ─── Google OAuth ───────────────────────────────────────────────────────────
export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: 'No Google credential provided' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ message: 'Invalid Google token' });
        }

        const { email, name, sub: googleId } = payload;

        let user = await prisma.user.findUnique({ where: { email } });

        const now = new Date();
        if (!user) {
            // Auto-register new Google users as STUDENT
            const randomPassword = await bcrypt.hash(googleId + Date.now(), 10);
            user = await prisma.user.create({
                data: {
                    name: name || email.split('@')[0],
                    email,
                    password: randomPassword,
                    role: 'STUDENT',
                    lastLogin: now,
                    currentStreak: 1,
                    longestStreak: 1,
                }
            });
        } else {
            // Update streak like normal login
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            let newStreak = user.currentStreak || 0;
            let newLongest = user.longestStreak || 0;

            if (user.lastLogin) {
                const lastDay = new Date(new Date(user.lastLogin).getFullYear(), new Date(user.lastLogin).getMonth(), new Date(user.lastLogin).getDate());
                const diffDays = Math.floor(Math.abs(today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) newStreak += 1;
                else if (diffDays > 1) newStreak = 1;
            }
            if (newStreak > newLongest) newLongest = newStreak;

            user = await prisma.user.update({
                where: { id: user.id },
                data: { lastLogin: now, currentStreak: newStreak, longestStreak: newLongest }
            });
        }

        const token = generateToken({ id: user.id, role: user.role });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, currentStreak: user.currentStreak, longestStreak: user.longestStreak } });
    } catch (error: any) {
        res.status(500).json({ message: 'Google authentication failed', error: error.message });
    }
};

// ─── Update Profile ──────────────────────────────────────────────────────────
export const updateProfile = async (req: any, res: Response) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Name cannot be empty' });
        }

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { name: name.trim() }
        });

        res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error: any) {
        res.status(500).json({ message: 'Profile update failed', error: error.message });
    }
};

// ─── Change Password ─────────────────────────────────────────────────────────
export const changePassword = async (req: any, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Password change failed', error: error.message });
    }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        // Always return success to prevent email enumeration attacks
        if (!user) {
            return res.json({ message: 'If this email is registered, you will receive reset instructions.' });
        }

        // In a real app, you'd send an email here. We return success.
        res.json({ message: 'If this email is registered, you will receive reset instructions.' });
    } catch (error: any) {
        res.status(500).json({ message: 'Request failed', error: error.message });
    }
};
