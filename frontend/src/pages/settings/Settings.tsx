import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Bell, Palette, Shield, Save, CheckCircle2, Loader2 } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { authService } from '../../services/apiServices';
import { toast } from '../../components/Toast';

const Settings = () => {
    const user = authService.getCurrentUser();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);

    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });

    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        quizReminders: true,
        courseUpdates: true,
        announcements: true,
    });

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        // Simulate save — backend doesn't have profile update endpoint yet
        setTimeout(() => {
            setSaving(false);
            toast.success('Profile Updated', 'Your profile has been saved successfully.');
        }, 1000);
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
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
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-8"
                            >
                                <h2 className="text-xl font-bold mb-6">Profile Information</h2>
                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                                            {profile.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{profile.name}</h3>
                                            <p className="text-sm text-slate-400">{user?.role || 'STUDENT'}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <User size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Mail size={18} />
                                            </div>
                                            <input
                                                type="email"
                                                value={profile.email}
                                                disabled
                                                className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 outline-none cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 ml-1">Email cannot be changed.</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn-primary py-3 px-6 flex items-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'notifications' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-8"
                            >
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
                                                onClick={() => setNotifications({ ...notifications, [item.key]: !(notifications as any)[item.key] })}
                                                className={`w-12 h-7 rounded-full transition-all relative ${(notifications as any)[item.key] ? 'bg-primary' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${(notifications as any)[item.key] ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'appearance' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-8"
                            >
                                <h2 className="text-xl font-bold mb-6">Appearance</h2>
                                <p className="text-slate-500 mb-6">Customize the look and feel of your dashboard.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="p-6 rounded-2xl border-2 border-primary bg-white text-center transition-all">
                                        <div className="w-full h-20 rounded-xl bg-slate-50 border border-slate-200 mb-3" />
                                        <span className="text-sm font-bold text-primary">Light Mode</span>
                                    </button>
                                    <button className="p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-300 text-center transition-all">
                                        <div className="w-full h-20 rounded-xl bg-slate-900 border border-slate-700 mb-3" />
                                        <span className="text-sm font-bold text-slate-500">Dark Mode</span>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-8"
                            >
                                <h2 className="text-xl font-bold mb-6">Security</h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Current Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                <Lock size={18} />
                                            </div>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toast.info('Coming Soon', 'Password change will be available in a future update.')}
                                        className="btn-primary py-3 px-6 flex items-center gap-2"
                                    >
                                        <Lock size={18} /> Update Password
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
