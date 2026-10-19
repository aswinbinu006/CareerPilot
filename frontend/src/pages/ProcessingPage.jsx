import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import AgentStoryteller from '../components/processing/AgentStoryteller';
import ErrorState from '../components/common/ErrorState';
import { api } from '../services/api';

export default function ProcessingPage() {
  const [error, setError] = useState(null);
  const [studentName, setStudentName] = useState('Student');
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();
  const hasExecuted = useRef(false);

  const saveCompletedSessionEntry = (sessionId, result, user, profileData) => {
    sessionStorage.setItem(`report_${sessionId}`, JSON.stringify(result));
    localStorage.setItem(`careerpilot_report_${sessionId}`, JSON.stringify(result));

    const recommendedDegree =
      result.planner_recommendations?.recommended_degree ||
      result.recommendation?.recommended_degree ||
      result.degree ||
      'Career Guidance Dossier';
    const stream = profileData?.stream || 'Class 12 Advisory';
    const confidence =
      result.planner_recommendations?.confidence_score ||
      result.confidence ||
      0.94;

    const newEntry = {
      session_id: sessionId,
      student_name: user?.name || profileData?.name || 'Class 12 Student',
      recommended_degree: recommendedDegree,
      stream: stream,
      confidence: confidence,
      created_at: new Date().toISOString(),
      user_email: user?.email || '',
    };

    if (user?.email) {
      const userKey = `careerpilot_completed_sessions_${user.email.toLowerCase().trim()}`;
      try {
        const existing = JSON.parse(localStorage.getItem(userKey) || '[]');
        const filtered = existing.filter((item) => item.session_id !== sessionId);
        filtered.unshift(newEntry);
        localStorage.setItem(userKey, JSON.stringify(filtered));
      } catch {}
      localStorage.setItem(`careerpilot_latest_session_id_${user.email.toLowerCase().trim()}`, sessionId);
    }
  };

  const executePipeline = async () => {
    setError(null);
    let profileData = null;

    try {
      const stored = sessionStorage.getItem('careerpilot_active_profile');
      if (!stored) {
        navigate('/assessment');
        return;
      }
      profileData = JSON.parse(stored);
      setStudentName(profileData.name || 'Student');
    } catch {
      navigate('/assessment');
      return;
    }

    const user = api.getCurrentUser();
    const email = (user?.email || profileData.user_email || '').toLowerCase().trim();
    if (email && !profileData.user_email) {
      profileData.user_email = email;
    }

    // 1. Initial check: If user refreshed while backend was already finalizing a session
    if (email) {
      try {
        const recentSessions = await api.getRecentSessions({ user_email: email });
        if (recentSessions && recentSessions.length > 0) {
          const latest = recentSessions[0];
          const ageMs = Date.now() - new Date(latest.created_at || latest.updated_at || Date.now()).getTime();
          if (ageMs < 120000 && latest.session_id) {
            setIsCompleted(true);
            sessionStorage.removeItem('careerpilot_active_profile');
            setTimeout(() => {
              navigate(`/report/${latest.session_id}`);
            }, 1000);
            return;
          }
        }
      } catch {}
    }

    // 2. Background polling: As soon as GuidanceAgent writes to SQLite, poller routes student
    let isFinished = false;
    const pollInterval = setInterval(async () => {
      if (isFinished || !email) return;
      try {
        const sessions = await api.getRecentSessions({ user_email: email });
        if (sessions && sessions.length > 0) {
          const latest = sessions[0];
          const ageMs = Date.now() - new Date(latest.created_at || latest.updated_at || Date.now()).getTime();
          if (ageMs < 150000 && latest.session_id) {
            isFinished = true;
            clearInterval(pollInterval);
            setIsCompleted(true);
            sessionStorage.removeItem('careerpilot_active_profile');
            setTimeout(() => {
              navigate(`/report/${latest.session_id}`);
            }, 1000);
          }
        }
      } catch {}
    }, 3500);

    try {
      // Execute the live FastAPI backend assessment endpoint
      const result = await api.startAssessment(profileData);

      if (isFinished) return;
      isFinished = true;
      clearInterval(pollInterval);

      if (result && result.session_id) {
        saveCompletedSessionEntry(result.session_id, result, user, profileData);
        sessionStorage.removeItem('careerpilot_active_profile');
        setIsCompleted(true);

        setTimeout(() => {
          navigate(`/report/${result.session_id}`);
        }, 1200);
      } else {
        throw new Error('Unexpected response format from the career advisory server.');
      }
    } catch (err) {
      clearInterval(pollInterval);
      if (isFinished) return;

      // Fail-safe check: verify if the report was saved in DB despite connection drop
      if (email) {
        try {
          const sessions = await api.getRecentSessions({ user_email: email });
          if (sessions && sessions.length > 0) {
            const latest = sessions[0];
            const ageMs = Date.now() - new Date(latest.created_at || latest.updated_at || Date.now()).getTime();
            if (ageMs < 180000 && latest.session_id) {
              isFinished = true;
              setIsCompleted(true);
              sessionStorage.removeItem('careerpilot_active_profile');
              navigate(`/report/${latest.session_id}`);
              return;
            }
          }
        } catch {}
      }

      setError(
        err.message || 'Unable to communicate with the advisory pipeline. Please verify the backend server is running.'
      );
    }
  };

  useEffect(() => {
    if (!hasExecuted.current) {
      hasExecuted.current = true;
      executePipeline();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-textPrimary">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-6">
        {error ? (
          <div className="w-full max-w-md animate-fade-in">
            <ErrorState
              title="Pipeline Execution Interrupted"
              message={error}
              onRetry={() => {
                hasExecuted.current = false;
                executePipeline();
              }}
            />
          </div>
        ) : (
          <AgentStoryteller studentName={studentName} isCompleted={isCompleted} />
        )}
      </main>
    </div>
  );
}
