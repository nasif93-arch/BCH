/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  AlertCircle, 
  MessageSquare, 
  ClipboardList, 
  Home, 
  User, 
  MapPin, 
  Camera, 
  Mic, 
  Search, 
  ChevronRight, 
  Bell, 
  Moon, 
  Sun, 
  Globe,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Flame,
  Ambulance,
  PhoneCall,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from './translations';
import Markdown from 'react-markdown';

// --- Types ---
type Language = 'en' | 'bn';
type Tab = 'home' | 'report' | 'track' | 'helpline' | 'profile';

interface Complaint {
  id: string;
  name: string;
  phone: string;
  category: string;
  description: string;
  location: string;
  photo?: string;
  voice?: string;
  status: 'Pending' | 'Processing' | 'Solved';
  created_at: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  created_at: string;
}

// --- Main App Component ---
export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const t = translations[lang];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  return (
    <div className={`min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-300 pb-20`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
          <h1 className="font-bold text-lg tracking-tight hidden sm:block">{t.appName}</h1>
          <h1 className="font-bold text-lg tracking-tight sm:hidden">C-Helpline</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <Globe size={18} />
            <span>{lang === 'en' ? 'BN' : 'EN'}</span>
          </button>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors relative"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-neutral-900"></span>
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                    <h3 className="font-bold">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-neutral-50 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                          <p className="font-semibold text-sm">{n.title}</p>
                          <p className="text-xs text-neutral-500 mt-1">{n.message}</p>
                          <p className="text-[10px] text-neutral-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-neutral-500 text-sm">No new notifications</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <HomeView key="home" t={t} lang={lang} onSOS={() => setShowSOSModal(true)} onTabChange={setActiveTab} />}
          {activeTab === 'report' && <ReportView key="report" t={t} lang={lang} />}
          {activeTab === 'track' && <TrackView key="track" t={t} lang={lang} />}
          {activeTab === 'helpline' && <HelplineView key="helpline" t={t} lang={lang} />}
          {activeTab === 'profile' && <ProfileView key="profile" t={t} lang={lang} />}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 px-2 py-2 flex justify-around items-center z-40">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={20} />} label={t.home} />
        <NavButton active={activeTab === 'report'} onClick={() => setActiveTab('report')} icon={<AlertCircle size={20} />} label={lang === 'en' ? 'Report' : 'রিপোর্ট'} />
        <NavButton active={activeTab === 'track'} onClick={() => setActiveTab('track')} icon={<ClipboardList size={20} />} label={lang === 'en' ? 'Track' : 'ট্র্যাক'} />
        <NavButton active={activeTab === 'helpline'} onClick={() => setActiveTab('helpline')} icon={<Phone size={20} />} label={lang === 'en' ? 'Helpline' : 'হেল্পলাইন'} />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={20} />} label={t.profile} />
      </nav>

      {/* SOS Modal */}
      <AnimatePresence>
        {showSOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSOSModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="bg-red-600 p-6 text-white text-center">
                <ShieldAlert size={48} className="mx-auto mb-2" />
                <h2 className="text-2xl font-bold">{t.sosTitle}</h2>
                <p className="opacity-90">{t.sosSubtitle}</p>
              </div>
              <div className="p-6 grid gap-4">
                <EmergencyCallButton icon={<ShieldAlert className="text-blue-600" />} label={t.police} number="999" sub="Police / Emergency" />
                <EmergencyCallButton icon={<Ambulance className="text-red-600" />} label={t.ambulance} number="999" sub="Medical Emergency" />
                <EmergencyCallButton icon={<Flame className="text-orange-600" />} label={t.fire} number="999" sub="Fire & Rescue" />
                <button 
                  onClick={() => setShowSOSModal(false)}
                  className="mt-2 w-full py-3 text-neutral-500 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Support Floating Button */}
      <button 
        onClick={() => setShowChat(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-30"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Modal */}
      <AnimatePresence>
        {showChat && <ChatModal t={t} lang={lang} onClose={() => setShowChat(false)} />}
      </AnimatePresence>

      {/* Footer */}
      <footer className="text-center py-8 text-neutral-400 text-xs px-4">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
}

// --- Sub-Views ---

function HomeView({ t, onSOS, onTabChange, lang }: { t: any, onSOS: () => void, onTabChange: (tab: Tab) => void, lang: Language }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-500">{t.appName}</h2>
        <p className="text-neutral-500 dark:text-neutral-400">{lang === 'en' ? 'Serving Chapainawabgonj with Pride' : 'চাঁপাইনবাবগঞ্জের সেবায় গর্বিত'}</p>
      </div>

      {/* SOS Button */}
      <div className="flex justify-center py-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSOS}
          className="relative w-48 h-48 rounded-full bg-red-600 flex flex-col items-center justify-center text-white shadow-[0_0_50px_rgba(220,38,38,0.3)] border-8 border-red-500/50"
        >
          <div className="absolute inset-0 rounded-full animate-ping bg-red-600/20"></div>
          <ShieldAlert size={64} />
          <span className="text-2xl font-black mt-2 tracking-widest">{t.sos}</span>
        </motion.button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        <QuickActionCard 
          icon={<AlertCircle className="text-emerald-600" />} 
          label={t.reportProblem} 
          onClick={() => onTabChange('report')} 
        />
        <QuickActionCard 
          icon={<ClipboardList className="text-blue-600" />} 
          label={t.trackComplaint} 
          onClick={() => onTabChange('track')} 
        />
        <QuickActionCard 
          icon={<PhoneCall className="text-orange-600" />} 
          label={t.helplineNumbers} 
          onClick={() => onTabChange('helpline')} 
        />
        <QuickActionCard 
          icon={<Search className="text-purple-600" />} 
          label={t.faq.title} 
          onClick={() => {}} 
        />
      </div>

      {/* Announcements / News */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={20} className="text-emerald-600" />
          <h3 className="font-bold">{lang === 'en' ? 'Important Announcements' : 'গুরুত্বপূর্ণ ঘোষণা'}</h3>
        </div>
        <div className="space-y-4">
          <AnnouncementItem 
            title={lang === 'en' ? 'New Water Pipeline Project' : 'নতুন পানি সরবরাহ প্রকল্প'} 
            date="2 hours ago" 
          />
          <AnnouncementItem 
            title={lang === 'en' ? 'Electricity Maintenance in Shibganj' : 'শিবগঞ্জে বিদ্যুৎ রক্ষণাবেক্ষণ'} 
            date="5 hours ago" 
          />
        </div>
      </div>
    </motion.div>
  );
}

function ReportView({ t, lang }: { t: any, lang: Language }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    category: 'Road Problem',
    description: '',
    location: '',
    photo: '',
    voice: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setTicketId(data.id);
      // Save phone for history
      localStorage.setItem('userPhone', formData.phone);
    } catch (err) {
      alert('Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGPSLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData({ ...formData, location: `${pos.coords.latitude}, ${pos.coords.longitude}` });
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          setFormData({ ...formData, voice: reader.result as string });
        };
      };
      mediaRecorder.current.start();
      setRecording(true);
    } catch (err) {
      alert('Microphone access denied');
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setRecording(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData({ ...formData, photo: reader.result as string });
      };
    }
  };

  if (ticketId) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-6 py-12"
      >
        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{lang === 'en' ? 'Complaint Submitted!' : 'অভিযোগ জমা হয়েছে!'}</h2>
          <p className="text-neutral-500">{lang === 'en' ? 'Your ticket ID is:' : 'আপনার টিকিট আইডি হলো:'}</p>
          <div className="text-3xl font-mono font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 py-4 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-800">
            {ticketId}
          </div>
        </div>
        <p className="text-sm text-neutral-400 px-8">
          {lang === 'en' ? 'Please keep this ID to track your complaint status.' : 'আপনার অভিযোগের অবস্থা ট্র্যাক করতে এই আইডিটি সংরক্ষণ করুন।'}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20"
        >
          {lang === 'en' ? 'Back to Home' : 'হোমে ফিরে যান'}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">{t.reportProblem}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-500">{t.form.name}</label>
          <input 
            required
            type="text" 
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-500">{t.form.phone}</label>
          <input 
            required
            type="tel" 
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-500">{t.form.category}</label>
          <select 
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            {Object.entries(t.categories).map(([key, val]) => (
              <option key={key} value={val as string}>{val as string}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-500">{t.form.description}</label>
          <textarea 
            required
            rows={4}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Media Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button 
            type="button"
            onClick={getGPSLocation}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-colors ${formData.location ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200' : 'bg-white dark:bg-neutral-900'}`}
          >
            <MapPin size={20} className={formData.location ? 'text-emerald-600' : 'text-neutral-400'} />
            <span className="text-[10px] mt-1 font-medium">{t.form.location}</span>
          </button>
          <label className={`flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer transition-colors ${formData.photo ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200' : 'bg-white dark:bg-neutral-900'}`}>
            <Camera size={20} className={formData.photo ? 'text-emerald-600' : 'text-neutral-400'} />
            <span className="text-[10px] mt-1 font-medium">{t.form.uploadPhoto}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          <button 
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 transition-colors ${recording ? 'bg-red-50 dark:bg-red-900/20 border-red-200' : formData.voice ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200' : 'bg-white dark:bg-neutral-900'}`}
          >
            <Mic size={20} className={recording ? 'text-red-600 animate-pulse' : formData.voice ? 'text-emerald-600' : 'text-neutral-400'} />
            <span className="text-[10px] mt-1 font-medium">{recording ? 'Stop' : t.form.recordVoice}</span>
          </button>
        </div>

        <button 
          disabled={isSubmitting}
          type="submit"
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          {t.form.submit}
        </button>
      </form>
    </motion.div>
  );
}

function TrackView({ t, lang }: { t: any, lang: Language }) {
  const [ticketId, setTicketId] = useState('');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    if (!ticketId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/complaints/${ticketId.toUpperCase()}`);
      if (!res.ok) throw new Error('Ticket not found');
      const data = await res.json();
      setComplaint(data);
    } catch (err) {
      setError(lang === 'en' ? 'Invalid Ticket ID' : 'ভুল টিকিট আইডি');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">{t.tracking.title}</h2>
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder={t.tracking.placeholder}
          className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          value={ticketId}
          onChange={e => setTicketId(e.target.value)}
        />
        <button 
          onClick={handleTrack}
          disabled={loading}
          className="bg-emerald-600 text-white px-6 rounded-xl font-bold flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {complaint && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-neutral-400 uppercase tracking-wider font-bold">{lang === 'en' ? 'Ticket ID' : 'টিকিট আইডি'}</p>
              <p className="text-xl font-mono font-black text-emerald-600">{complaint.id}</p>
            </div>
            <StatusBadge status={complaint.status} t={t} />
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">{t.form.category}</p>
                <p className="font-semibold">{complaint.category}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">{lang === 'en' ? 'Submitted On' : 'জমা দেওয়ার তারিখ'}</p>
                <p className="font-semibold">{new Date(complaint.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-xs text-neutral-400 mb-1">{t.form.description}</p>
            <p className="text-sm leading-relaxed">{complaint.description}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function HelplineView({ t, lang }: { t: any, lang: Language }) {
  const numbers = [
    { name: t.police, number: '999', icon: <ShieldAlert />, color: 'bg-blue-600' },
    { name: t.ambulance, number: '999', icon: <Ambulance />, color: 'bg-red-600' },
    { name: t.fire, number: '999', icon: <Flame />, color: 'bg-orange-600' },
    { name: lang === 'en' ? 'Women & Child Helpline' : 'নারী ও শিশু হেল্পলাইন', number: '109', icon: <User />, color: 'bg-purple-600' },
    { name: lang === 'en' ? 'Electricity Emergency' : 'বিদ্যুৎ জরুরী সেবা', number: '16123', icon: <AlertCircle />, color: 'bg-yellow-600' },
    { name: lang === 'en' ? 'Gas Emergency' : 'গ্যাস জরুরী সেবা', number: '16505', icon: <AlertCircle />, color: 'bg-emerald-600' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">{t.helplineNumbers}</h2>
      <div className="grid gap-4">
        {numbers.map((n, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${n.color} text-white rounded-xl flex items-center justify-center`}>
                {React.cloneElement(n.icon as any, { size: 24 })}
              </div>
              <div>
                <h3 className="font-bold">{n.name}</h3>
                <p className="text-xl font-mono font-black text-neutral-400">{n.number}</p>
              </div>
            </div>
            <a 
              href={`tel:${n.number}`}
              className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
            >
              <PhoneCall size={20} />
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ProfileView({ t, lang }: { t: any, lang: Language }) {
  const [history, setHistory] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const phone = localStorage.getItem('userPhone');

  useEffect(() => {
    if (phone) {
      fetchHistory();
    }
  }, [phone]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/user/${phone}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 py-4">
        <div className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-xl shadow-emerald-600/20">
          {phone ? phone.slice(-2) : 'U'}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{lang === 'en' ? 'User Profile' : 'ব্যবহারকারীর প্রোফাইল'}</h2>
          <p className="text-neutral-500">{phone || (lang === 'en' ? 'No phone registered' : 'কোনো ফোন নিবন্ধিত নেই')}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">{lang === 'en' ? 'Complaint History' : 'অভিযোগের ইতিহাস'}</h3>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-600" /></div>
        ) : history.length > 0 ? (
          <div className="space-y-4">
            {history.map(c => (
              <div key={c.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-mono font-bold text-emerald-600">{c.id}</p>
                  <p className="text-sm font-medium">{c.category}</p>
                  <p className="text-[10px] text-neutral-400">{new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <StatusBadge status={c.status} t={t} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <ClipboardList className="mx-auto text-neutral-300 mb-2" size={48} />
            <p className="text-neutral-400 text-sm">{lang === 'en' ? 'No complaints found' : 'কোনো অভিযোগ পাওয়া যায়নি'}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// --- Helper Components ---

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 w-16 transition-all ${active ? 'text-emerald-600' : 'text-neutral-400'}`}
    >
      <div className={`p-1 rounded-xl transition-all ${active ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function QuickActionCard({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <motion.button 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-white dark:bg-neutral-900 p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col items-center text-center gap-3 transition-all"
    >
      <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
        {React.cloneElement(icon as any, { size: 24 })}
      </div>
      <span className="text-xs font-bold leading-tight">{label}</span>
    </motion.button>
  );
}

function AnnouncementItem({ title, date }: { title: string, date: string }) {
  return (
    <div className="flex items-start gap-3 group cursor-pointer">
      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 group-hover:scale-150 transition-transform"></div>
      <div>
        <p className="text-sm font-medium group-hover:text-emerald-600 transition-colors">{title}</p>
        <p className="text-[10px] text-neutral-400">{date}</p>
      </div>
    </div>
  );
}

function EmergencyCallButton({ icon, label, number, sub }: { icon: React.ReactNode, label: string, number: string, sub: string }) {
  return (
    <a 
      href={`tel:${number}`}
      className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white dark:bg-neutral-900 rounded-xl flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <div className="text-left">
          <p className="font-bold text-lg">{label}</p>
          <p className="text-xs text-neutral-400">{sub}</p>
        </div>
      </div>
      <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
        <PhoneCall size={18} />
      </div>
    </a>
  );
}

function StatusBadge({ status, t }: { status: string, t: any }) {
  const colors = {
    Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500',
    Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500',
    Solved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500'
  };
  
  const label = status === 'Pending' ? t.tracking.pending : status === 'Processing' ? t.tracking.processing : t.tracking.solved;

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colors[status as keyof typeof colors]}`}>
      {label}
    </span>
  );
}

function ChatModal({ t, lang, onClose }: { t: any, lang: Language, onClose: () => void }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: lang === 'en' ? 'Hello! How can I help you today?' : 'হ্যালো! আমি আপনাকে কীভাবে সাহায্য করতে পারি?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 h-[80vh] sm:h-[600px] sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-bold">{t.chat.title}</h3>
              <p className="text-[10px] opacity-80">Online Support Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-neutral-950">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-tl-none'}`}>
                <Markdown>{m.text}</Markdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-neutral-800 p-3 rounded-2xl rounded-tl-none border border-neutral-200 dark:border-neutral-700">
                <Loader2 size={16} className="animate-spin text-emerald-600" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex gap-2">
          <input 
            type="text" 
            placeholder={t.chat.placeholder}
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
