import { motion } from 'framer-motion';
import { Megaphone, Calendar, User, ArrowRight } from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: { name: string };
}

const AnnouncementFeed = ({ announcements }: { announcements: Announcement[] }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Megaphone size={20} className="text-primary" />
                    Latest Announcements
                </h3>
                <button className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">Mark all as read</button>
            </div>

            <div className="space-y-4">
                {announcements.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card p-6 border-l-4 border-l-primary group cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h4 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{item.title}</h4>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">
                                <Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">
                            {item.content}
                        </p>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User size={12} />
                                </div>
                                By {item.author.name}
                            </div>
                            <button className="text-primary opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 text-xs font-bold">
                                Read More <ArrowRight size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}

                {announcements.length === 0 && (
                    <div className="py-20 text-center glass-card border-dashed">
                        <Megaphone size={40} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 text-sm italic">No active announcements at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementFeed;
