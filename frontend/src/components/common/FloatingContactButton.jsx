import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Sparkles,
  X,
  Send,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Compass,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { api } from '../../services/api';

export default function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [starters, setStarters] = useState([]);
  const [studentSession, setStudentSession] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [hasAssessment, setHasAssessment] = useState(true);

  const buttonRef = useRef(null);
  const chatWindowRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Scroll messages to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  // Load session info, conversation history, and starters when opened
  useEffect(() => {
    const initChat = async () => {
      const user = api.getCurrentUser();
      const latestSessionId = localStorage.getItem('careerpilot_latest_session_id');

      // 1. Fetch recent assessment session
      let activeSession = null;
      try {
        const res = await api.getRecentSessions();
        if (res && Array.isArray(res.recent_sessions) && res.recent_sessions.length > 0) {
          if (latestSessionId) {
            activeSession = res.recent_sessions.find((s) => s.session_id === latestSessionId);
          }
          if (!activeSession && user?.name) {
            const uName = user.name.toLowerCase().trim();
            activeSession = res.recent_sessions.find(
              (s) => s.student_name && s.student_name.toLowerCase().trim().includes(uName)
            );
          }
          if (!activeSession) {
            activeSession = res.recent_sessions[0];
          }
        }
      } catch (err) {
        console.error('Failed to load recent session:', err);
      }

      setStudentSession(activeSession);

      // 2. Fetch starters
      try {
        const starterRes = await api.getMentorStarters(
          activeSession?.session_id || latestSessionId,
          user?.email
        );
        if (starterRes && starterRes.starters) {
          setStarters(starterRes.starters);
        }
      } catch {}

      // 3. Fetch conversation history
      try {
        const historyRes = await api.getMentorHistory(
          activeSession?.session_id || latestSessionId,
          user?.email
        );
        if (historyRes && Array.isArray(historyRes.history) && historyRes.history.length > 0) {
          setMessages(
            historyRes.history.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              agent_used: m.agent_used || 'Career Mentor',
              sources: m.sources || [],
              timestamp: m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Just now',
            }))
          );
        } else {
          // Initialize greeting
          if (activeSession) {
            setMessages([
              {
                id: 'welcome',
                role: 'assistant',
                content: `Hello ${
                  user?.name?.split(' ')[0] || activeSession.student_name?.split(' ')[0] || 'there'
                }! I am your **Career Mentor AI**.\n\nI have deliberated on your assessment for **${
                  activeSession.recommended_degree
                }** (${Math.round(
                  (activeSession.confidence || 0.94) * 100
                )}% confidence). Ask me why this recommendation was selected, request a study plan, compare careers, or explore verified colleges.`,
                agent_used: 'Career Mentor',
                sources: [],
                timestamp: 'Just now',
              },
            ]);
          } else {
            setHasAssessment(false);
            setMessages([
              {
                id: 'empty',
                role: 'assistant',
                content:
                  "I'd love to help you choose the right career! Complete your 5-minute assessment first so I can give personalized guidance based on your marks, interests, and goals.",
                agent_used: 'Career Mentor',
                sources: [],
                timestamp: 'Just now',
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      }
    };

    if (isOpen) {
      initChat();
    }
  }, [isOpen]);

  // Handle open / close animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !chatWindowRef.current) return;

    if (isOpen) {
      gsap.fromTo(
        chatWindowRef.current,
        { opacity: 0, scale: 0.94, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.4)' }
      );
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const user = api.getCurrentUser();
    const sessionId =
      studentSession?.session_id || localStorage.getItem('careerpilot_latest_session_id');

    const newUserMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await api.sendMentorMessage(text, sessionId, user?.email);
      if (response) {
        if (response.has_assessment === false) {
          setHasAssessment(false);
        } else {
          setHasAssessment(true);
        }

        const newAssistantMsg = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.response,
          agent_used: response.agent_used || 'Career Mentor',
          sources: response.sources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, newAssistantMsg]);

        if (response.starters && response.starters.length > 0) {
          setStarters(response.starters);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            "I encountered a temporary connection issue. Please ensure the backend server is running, or ask me again.",
          agent_used: 'Career Mentor',
          sources: [],
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    const user = api.getCurrentUser();
    const sessionId =
      studentSession?.session_id || localStorage.getItem('careerpilot_latest_session_id');
    try {
      await api.clearMentorHistory(sessionId, user?.email);
      setMessages([
        {
          id: 'cleared',
          role: 'assistant',
          content:
            "Conversation memory cleared. How can I help you today with your career trajectory?",
          agent_used: 'Career Mentor',
          sources: [],
          timestamp: 'Just now',
        },
      ]);
    } catch {}
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedMarkdown = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Headers ###
          if (trimmed.startsWith('### ')) {
            return (
              <h5 key={idx} className="font-semibold text-textPrimary text-xs pt-1 border-b border-borderMuted/30 pb-0.5">
                {trimmed.replace('### ', '')}
              </h5>
            );
          }

          // Headers ##
          if (trimmed.startsWith('## ')) {
            return (
              <h4 key={idx} className="font-serif font-bold text-sm text-textPrimary pt-1">
                {trimmed.replace('## ', '')}
              </h4>
            );
          }

          // Bullet point
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const itemText = trimmed.replace(/^[-*]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-accent text-sm leading-none">•</span>
                <span>{renderInlineStyles(itemText)}</span>
              </div>
            );
          }

          // Numbered item
          if (/^\d+\.\s+/.test(trimmed)) {
            const itemText = trimmed.replace(/^\d+\.\s+/, '');
            const num = trimmed.match(/^\d+/)[0];
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-accent font-mono text-[11px] font-semibold">{num}.</span>
                <span>{renderInlineStyles(itemText)}</span>
              </div>
            );
          }

          return <p key={idx}>{renderInlineStyles(trimmed)}</p>;
        })}
      </div>
    );
  };

  const renderInlineStyles = (text) => {
    // Basic bold **text** parsing
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-textPrimary">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Bottom-Right Launcher Button */}
      <div ref={buttonRef} className="fixed bottom-6 right-6 z-40 no-print">
        <button
          onClick={() => setIsOpen(!isOpen)}
          data-cursor="Advisory"
          aria-label="Open Career Mentor AI"
          className={`group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-luxury hover:shadow-2xl border transition-all duration-300 active:scale-95 cursor-pointer ${
            isOpen
              ? 'bg-accent text-white border-accent'
              : 'bg-charcoal dark:bg-accent hover:bg-accent dark:hover:bg-accent-hover text-white border-borderMuted/30'
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center text-accent-light">
            <Sparkles className="w-4 h-4 text-amber-300 stroke-[2] transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <span className="text-xs font-mono font-medium tracking-wide max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-out whitespace-nowrap">
            Career Mentor AI
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Slide-Over Career Mentor Panel */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="fixed inset-x-3 bottom-20 top-20 sm:inset-auto sm:bottom-24 sm:right-6 z-50 sm:w-[440px] sm:h-[620px] bg-surface/98 backdrop-blur-2xl border border-borderMuted rounded-3xl shadow-2xl flex flex-col overflow-hidden text-textPrimary animate-fade-in no-print"
        >
          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-borderMuted/80 bg-background/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-accent flex items-center justify-center text-white shadow-xs">
                <Compass className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-base font-semibold leading-none text-textPrimary">
                    Career Mentor AI
                  </h4>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] uppercase tracking-wider font-semibold">
                    Live
                  </span>
                </div>
                <div className="text-[11px] font-mono text-textSecondary truncate max-w-[220px] mt-0.5">
                  {studentSession
                    ? `Advising: ${studentSession.recommended_degree}`
                    : 'Class 12 Educational Guidance'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear conversation history"
                className="p-2 rounded-full text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close Chat"
                className="p-2 rounded-full text-textSecondary hover:text-textPrimary hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4"
            style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  {/* Agent attribution tag on mentor messages */}
                  {!isUser && (
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-textSecondary">
                      <Sparkles className="w-3 h-3 text-accent" />
                      <span>{msg.agent_used || 'Career Mentor'}</span>
                      <span className="text-borderMuted">•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}

                  <div
                    className={`relative p-4 rounded-2xl max-w-[88%] text-xs leading-relaxed ${
                      isUser
                        ? 'bg-charcoal dark:bg-accent text-white rounded-br-xs shadow-xs'
                        : 'bg-background border border-borderMuted text-textPrimary rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      renderFormattedMarkdown(msg.content)
                    )}

                    {/* Verified Search Sources pill (Pathway Agent transparency) */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-borderMuted/60 text-[10px] font-mono text-textSecondary">
                        <div className="flex items-center gap-1 text-accent font-semibold mb-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                          <span>Verified Educational Grounding:</span>
                        </div>
                        <div className="space-y-1">
                          {msg.sources.map((s, sIdx) => (
                            <a
                              key={sIdx}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:underline text-textPrimary truncate"
                            >
                              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                              <span className="truncate">{s.title || s.url}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Copy button for mentor responses */}
                    {!isUser && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Copy text"
                          className="p-1 rounded-md text-textSecondary hover:text-textPrimary hover:bg-surface/80 transition-all cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <span className="text-[10px] font-mono text-textSecondary mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Empty State Assessment Call to Action */}
            {!hasAssessment && (
              <div className="p-4 rounded-2xl bg-accent/10 border border-accent/25 text-center space-y-3 my-2">
                <GraduationCap className="w-6 h-6 text-accent mx-auto" />
                <p className="text-xs text-textPrimary font-medium">
                  Take your personalized 5-minute career assessment to unlock accurate counselling.
                </p>
                <Link
                  to="/assessment"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-charcoal dark:bg-accent hover:bg-accent dark:hover:bg-accent-hover text-white rounded-full text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Start Free Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono text-accent">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>Deliberating with Multi-Agent Pipeline...</span>
                </div>
                <div className="p-3.5 rounded-2xl rounded-bl-xs bg-background border border-borderMuted flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          {starters.length > 0 && !isTyping && (
            <div
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              className="px-4 py-2 border-t border-borderMuted/40 bg-background/40 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0"
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-textSecondary shrink-0">
                Suggested:
              </span>
              {starters.slice(0, 4).map((starter, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleSendMessage(starter)}
                  className="px-2.5 py-1 rounded-full bg-surface hover:bg-secondary text-[11px] font-mono text-textPrimary border border-borderMuted whitespace-nowrap transition-colors cursor-pointer shrink-0 hover:border-accent/40"
                >
                  {starter}
                </button>
              ))}
            </div>
          )}

          {/* Input Box Footer */}
          <div className="p-3 border-t border-borderMuted bg-background/90 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-surface border border-borderMuted rounded-2xl px-3 py-1.5 focus-within:border-accent transition-colors"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your recommendation, roadmaps, or colleges..."
                className="flex-1 bg-transparent text-xs text-textPrimary placeholder:text-textSecondary outline-none py-1.5"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                aria-label="Send message"
                className="p-2 rounded-xl bg-charcoal dark:bg-accent hover:bg-accent dark:hover:bg-accent-hover text-white disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[9px] font-mono text-textSecondary px-1 pt-1.5">
              <span>CareerPilot Career Mentor AI</span>
              <span>Grounded in your assessment</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
