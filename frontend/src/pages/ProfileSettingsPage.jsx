import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import MagneticButton from '../components/common/MagneticButton';
import { User, BookOpen, Bell, Shield, KeyRound, Trash2, Check, AlertTriangle, Save } from 'lucide-react';
import gsap from 'gsap';
import { api } from '../services/api';

export default function ProfileSettingsPage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [currentUser, setCurrentUser] = useState(null);
  const [savedMessage, setSavedMessage] = useState('');
  const containerRef = useRef(null);

  // Form states grounded in real user data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [stream, setStream] = useState('');
  const [board, setBoard] = useState('');
  const [marks, setMarks] = useState('');

  // Notifications
  const [notifExams, setNotifExams] = useState(true);
  const [notifScholarships, setNotifScholarships] = useState(true);
  const [notifDossiers, setNotifDossiers] = useState(true);

  // Password fields
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const user = api.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setName(user.name || '');
      setEmail(user.email || '');
    }

    // Load actual assessment profile if saved in session
    try {
      const stored = sessionStorage.getItem('careerpilot_active_profile') || localStorage.getItem('careerpilot_active_profile');
      if (stored) {
        const p = JSON.parse(stored);
        if (p.stream) setStream(p.stream);
        if (p.marks) setMarks(p.marks);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [activeTab]);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMessage('Settings successfully saved.');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const navItems = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'academic', label: 'Academic Profile', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'security', label: 'Security & Password', icon: KeyRound },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-14">
        <div className="mb-10 pb-6 border-b border-borderMuted">
          <span className="text-xs font-mono uppercase tracking-widest text-accent block mb-1">
            ACCOUNT GOVERNANCE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-textPrimary">
            Profile & Advisory Settings
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary mt-1">
            Configure your student identity, baseline 12th credentials, and privacy safeguards.
          </p>
        </div>

        {savedMessage && (
          <div className="mb-6 p-4 rounded-xl bg-accent-light border border-accent/20 text-accent flex items-center gap-2 text-xs font-mono animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{savedMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Segmented Sidebar Tabs */}
          <aside className="lg:col-span-4 p-2 rounded-2xl bg-surface border border-borderMuted space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-charcoal dark:bg-accent text-white font-semibold shadow-xs'
                      : 'text-textSecondary hover:text-textPrimary hover:bg-background/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Tab Content Panel */}
          <div
            ref={containerRef}
            className="lg:col-span-8 p-8 rounded-3xl bg-surface border border-borderMuted shadow-xs"
          >
            {/* 1. Personal Information */}
            {activeTab === 'personal' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-textPrimary mb-1">Personal Identity</h2>
                  <p className="text-xs text-textSecondary mb-6">Manage the name and communication email tied to your dossiers.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                      Primary Contact Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-borderMuted">
                  <Button type="submit" variant="primary" size="md" icon={Save}>
                    Save Changes
                  </Button>
                </div>
              </form>
            )}

            {/* 2. Academic Profile */}
            {activeTab === 'academic' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-textPrimary mb-1">Academic Credentials</h2>
                  <p className="text-xs text-textSecondary mb-6">These parameters feed directly into the Planner Agent's intake baseline.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                      Education Board
                    </label>
                    <select
                      value={board}
                      onChange={(e) => setBoard(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden"
                    >
                      <option>CBSE (Central Board of Secondary Education)</option>
                      <option>CISCE (ISC - Indian School Certificate)</option>
                      <option>State Higher Secondary Board</option>
                      <option>International Baccalaureate (IB) / Cambridge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                      Class 12 Stream
                    </label>
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden"
                    >
                      <option>PCM (Physics, Chemistry, Maths)</option>
                      <option>PCB (Physics, Chemistry, Biology)</option>
                      <option>Commerce with Maths</option>
                      <option>Commerce without Maths</option>
                      <option>Arts & Humanities</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                      Board Marks Aggregate / Percentage
                    </label>
                    <input
                      type="text"
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                      placeholder="e.g. 88%"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-borderMuted">
                  <Button type="submit" variant="primary" size="md" icon={Save}>
                    Update Academic Profile
                  </Button>
                </div>
              </form>
            )}

            {/* 3. Notification Preferences */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-textPrimary mb-1">Advisory Dispatch Settings</h2>
                  <p className="text-xs text-textSecondary mb-6">Choose which alerts are forwarded to your registered email.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-borderMuted">
                    <div>
                      <h4 className="font-serif text-base text-textPrimary">Entrance Examination Windows</h4>
                      <p className="text-xs text-textSecondary">Receive notifications when NTA registration portals open.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifExams}
                      onChange={(e) => setNotifExams(e.target.checked)}
                      className="w-4 h-4 accent-accent cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-borderMuted">
                    <div>
                      <h4 className="font-serif text-base text-textPrimary">Scholarship & Fee Waiver Alerts</h4>
                      <p className="text-xs text-textSecondary">Alerts for NSP and state merit scholarship releases.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifScholarships}
                      onChange={(e) => setNotifScholarships(e.target.checked)}
                      className="w-4 h-4 accent-accent cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-borderMuted">
                    <div>
                      <h4 className="font-serif text-base text-textPrimary">Dossier Pipeline Updates</h4>
                      <p className="text-xs text-textSecondary">Dispatches when four-year milestone revisions are published.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifDossiers}
                      onChange={(e) => setNotifDossiers(e.target.checked)}
                      className="w-4 h-4 accent-accent cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-borderMuted">
                  <Button onClick={handleSave} variant="primary" size="md" icon={Save}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}

            {/* 4. Privacy & Data Export */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-textPrimary mb-1">Data Governance & Export</h2>
                  <p className="text-xs text-textSecondary mb-6">Manage your records in accordance with Indian DPDP principles.</p>
                </div>

                <div className="p-5 rounded-2xl bg-background border border-borderMuted space-y-3">
                  <h4 className="font-serif text-lg text-textPrimary">Download Archive Dossier</h4>
                  <p className="text-xs text-textSecondary leading-relaxed">
                    Export a consolidated JSON and Markdown archive of all 8-step assessments, reasoning traces, and scholarship matches.
                  </p>
                  <button
                    onClick={() => alert('Dossier telemetry package generated. Initiating download...')}
                    className="px-4 py-2 rounded-full bg-surface hover:bg-surfaceLight border border-borderMuted text-xs font-mono uppercase tracking-wider text-textPrimary cursor-pointer"
                  >
                    Request Full Export (.ZIP)
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-red-50/60 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-300 text-xs font-mono uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Danger Zone</span>
                  </div>
                  <h4 className="font-serif text-lg text-textPrimary">Delete Student Dossier & Account</h4>
                  <p className="text-xs text-textSecondary leading-relaxed">
                    Permanently purges your student authentication credentials, saved assessments, and reasoning traces from our SQLite database. This action is irreversible.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* 5. Security & Password */}
            {activeTab === 'security' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <h2 className="font-serif text-2xl text-textPrimary mb-1">Security & Cipher</h2>
                  <p className="text-xs text-textSecondary mb-6">Maintain strict cryptographic hygiene for your student account.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currPassword}
                      onChange={(e) => setCurrPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-textSecondary mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-borderMuted text-sm text-textPrimary focus:border-accent focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-borderMuted">
                  <Button type="submit" variant="primary" size="md" icon={KeyRound}>
                    Update Credentials
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-md w-full bg-surface p-8 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl text-textPrimary mb-2">Confirm Account Deletion</h3>
            <p className="text-xs text-textSecondary leading-relaxed mb-6">
              Are you certain you wish to purge all stored assessments and NIRF benchmarks? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-full bg-background border border-borderMuted text-xs font-mono uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  api.logout();
                  window.location.href = '/';
                }}
                className="flex-1 py-2.5 rounded-full bg-red-600 text-white text-xs font-mono uppercase tracking-wider"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
