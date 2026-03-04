import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Bell, Palette, Shield, Save, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { authService } from '../../services/apiServices';
import { toast } from '../../components/Toast';

const Settings = () => {
    const user = authService.getCurrentUser();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [changingPwd, setChangingPwd] = useState(false);

    const [profile, setProfile] = useState({ name: user?.name || '' });

    const [passwords, setPasswords] = useState({
        current: '',
        newPwd: '',
        confirm: '',
    });

    const [notifications, setNotifications] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('notificationPrefs') || 'null') || {
                emailNotifications: true,
                quizReminders: true,
                courseUpdates: true,
                announcements: true,
            };
        } catch { return { emailNotifications: true, quizReminders: true, courseUpdates: true, announcements: true }; }
    });

    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await authService.updateProfile({ name: profile.name });
            toast.success('Profile Updated', 'Your name has been saved successfully.');
        } catch (err: any) {
            toast.error('Update Failed', err.response?.data?.message || 'Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPwd !== passwords.confirm) {
            toast.error('Passwords don\'t match', 'New password and confirmation must be identical.');
            return;
        }
        if (passwords.newPwd.length < 6) {
            toast.error('Too short', 'Password must be at least 6 characters.');
            return;
        }
        setChangingPwd(true);
        try {
            await authService.changePassword({ currentPassword: passwords.current, newPassword: passwords.newPwd });
            setPasswords({ current: '', newPwd: '', confirm: '' });
            toast.success('Password Changed', 'Your password has been updated. Please use it next time you log in.');
        } catch (err: any) {
            toast.error('Change Failed', err.response?.data?.message || 'Current password may be incorrect.');
        } finally {
            setChangingPwd(false);
        }
    };

    const toggleNotification = (key: string) => {
        const updated = { ...notifications, [key]: !notifications[key] };
        setNotifications(updated);
        localStorage.setItem('notificationPrefs', JSON.stringify(updated));
        toast.success('Saved', `${key} preference updated.`);
    };

    const toggleDarkMode = () => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setIsDark(!isDark);
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto py-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
                    <p className="text-slate-500 mb-8">Manage your account preferences and settings.</p>
                </motion.div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="md:w-56 flex-shrink-0">
                        <nav className="space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {/* ── Profile ── */}
                        {activeTab === 'profile' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
                                <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                                            {profile.name.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{profile.name}</h3>
                                            <p className="text-sm text-slate-400">{user?.role || 'STUDENT'}</p>
                                            <p className="text-xs text-slate-400">{user?.email || ''}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><User size={18} /></div>
                                            <input
                                                type="text"
                                                required
                                                value={profile.name}
                                                onChange={(e) => setProfile({ name: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Mail size={18} /></div>
                                            <input
                                                type="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 outline-none cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 ml-1">Email cannot be changed.</p>
                                    </div>

                                    <button type="submit" disabled={saving} className="btn-primary py-3 px-6 flex items-center gap-2 shadow-lg shadow-primary/20">
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* ── Notifications ── */}
                        {activeTab === 'notifications' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
                                <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
                                <div className="space-y-6">
                                    {[
                                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive important updates via email' },
                                        { key: 'quizReminders', label: 'Quiz Reminders', desc: 'Get reminders before quiz deadlines' },
                                        { key: 'courseUpdates', label: 'Course Updates', desc: 'Notifications when course content changes' },
                                        { key: 'announcements', label: 'Announcements', desc: 'Platform-wide announcements' },
                                    ].map(item => (
                                        <div key={item.key} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                                            <div>
                                                <div className="font-semibold text-slate-800">{item.label}</div>
                                                <div className="text-sm text-slate-400">{item.desc}</div>
                                            </div>
                                            <button
                                                onClick={() => toggleNotification(item.key)}
                                                className={`w-12 h-7 rounded-full transition-all relative ${(notifications as any)[item.key] ? 'bg-primary' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${(notifications as any)[item.key] ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── Appearance ── */}
                        {activeTab === 'appearance' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
                                <h2 className="text-xl font-bold mb-6">Appearance</h2>
                                <p className="text-slate-500 mb-6">Customize the look and feel of your dashboard.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => { if (isDark) toggleDarkMode(); }}
                                        className={`p-6 rounded-2xl border-2 text-center transition-all ${!isDark ? 'border-primary' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <div className="w-full h-20 rounded-xl bg-slate-50 border border-slate-200 mb-3" />
                                        <span className={`text-sm font-bold ${!isDark ? 'text-primary' : 'text-slate-500'}`}>Light Mode</span>
                                    </button>
                                    <button
                                        onClick={() => { if (!isDark) toggleDarkMode(); }}
                                        className={`p-6 rounded-2xl border-2 text-center transition-all ${isDark ? 'border-primary' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <div className="w-full h-20 rounded-xl bg-slate-900 border border-slate-700 mb-3" />
                                        <span className={`text-sm font-bold ${isDark ? 'text-primary' : 'text-slate-500'}`}>Dark Mode</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Security ── */}
                        {activeTab === 'security' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-8">
                                <h2 className="text-xl font-bold mb-6">Security</h2>
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Current Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Lock size={18} /></div>
                                            <input
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                value={passwords.current}
                                                onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Lock size={18} /></div>
                                            <input
                                                type="password"
                                                required
                                                minLength={6}
                                                placeholder="Min. 6 characters"
                                                value={passwords.newPwd}
                                                onChange={e => setPasswords({ ...passwords, newPwd: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Lock size={18} /></div>
                                            <input
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                value={passwords.confirm}
                                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={changingPwd} className="btn-primary py-3 px-6 flex items-center gap-2">
                                        {changingPwd ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                                        {changingPwd ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
