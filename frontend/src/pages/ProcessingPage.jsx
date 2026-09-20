import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import AgentStoryteller from '../components/processing/AgentStoryteller';
import ErrorState from '../components/common/ErrorState';
import { api } from '../services/api';

export default function ProcessingPage() {
  const [error, setError] = useState(null);
  const [studentName, setStudentName] = useState('Student');
  const navigate = useNavigate();
  const hasExecuted = useRef(false);

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

    try {
      const user = api.getCurrentUser();
      if (user?.email && !profileData.user_email) {
        profileData.user_email = user.email;
      }

      // Call the live FastAPI backend assessment endpoint
      const result = await api.startAssessment(profileData);

      if (result && result.session_id) {
        // Cache result for instant report rendering across sessions & devices
        sessionStorage.setItem(`report_${result.session_id}`, JSON.stringify(result));
        localStorage.setItem(`careerpilot_report_${result.session_id}`, JSON.stringify(result));
        
        // Track completed session for current user
        const recommendedDegree =
          result.planner_recommendations?.recommended_degree ||
          result.recommendation?.recommended_degree ||
          result.degree ||
          'Career Guidance Dossier';
        const stream = profileData.stream || 'Class 12 Advisory';
        const confidence =
          result.planner_recommendations?.confidence_score ||
          result.confidence ||
          0.94;

        const newEntry = {
          session_id: result.session_id,
          student_name: user?.name || profileData.name || 'Class 12 Student',
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
            const filtered = existing.filter((item) => item.session_id !== result.session_id);
            filtered.unshift(newEntry);
            localStorage.setItem(userKey, JSON.stringify(filtered));
          } catch {}
          localStorage.setItem(`careerpilot_latest_session_id_${user.email.toLowerCase().trim()}`, result.session_id);
        }

        // Clean up legacy un-namespaced keys to ensure zero cross-account leakage
        try {
          localStorage.removeItem('careerpilot_latest_session_id');
          localStorage.removeItem('careerpilot_completed_sessions');
          localStorage.removeItem('careerpilot_completed_sessions_student.demo@careerpilot.edu');
        } catch {}

        // Allow the storytelling animations to complete naturally
        setTimeout(() => {
          navigate(`/report/${result.session_id}`);
        }, 1500);
      } else {
        throw new Error('Unexpected response format from the career advisory server.');
      }
    } catch (err) {
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
          <AgentStoryteller studentName={studentName} />
        )}
      </main>
    </div>
  );
}
