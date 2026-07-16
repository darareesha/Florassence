
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getXP, saveXP, getDailyGoal, saveDailyGoal, getStudyStats, saveStudyStats } from '../services/storage';

const XPContext = createContext(null);

const XP_PER_LEVEL = 100;

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function XPProvider({ children }) {
  const [totalXP, setTotalXP] = useState(0);
  const [dailyGoal, setDailyGoal] = useState({
    targetSessions: 3, targetTasks: 5,
    sessionsCompleted: 0, tasksCompleted: 0, date: null,
  });
  const [stats, setStats] = useState({
    streak: 7, totalSessions: 0, totalTasks: 0, totalXP: 0,
    weeklyHours: [0.5, 1.5, 2.0, 1.0, 2.5, 3.0, 1.5],
    lastStudyDate: null,
  });

  useEffect(() => {
    Promise.all([getXP(), getDailyGoal(), getStudyStats()]).then(([xp, goal, st]) => {
      setTotalXP(xp?.total ?? 0);

      // Reset daily goal if it's a new day
      const today = todayStr();
      if (goal.date !== today) {
        const fresh = { ...goal, sessionsCompleted: 0, tasksCompleted: 0, date: today };
        setDailyGoal(fresh);
        saveDailyGoal(fresh);
      } else {
        setDailyGoal(goal);
      }
      setStats(st);
    });
  }, []);

  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXP % XP_PER_LEVEL;
  const xpProgress = xpInLevel / XP_PER_LEVEL;

  const addXP = useCallback(async (amount) => {
    setTotalXP((prev) => {
      const next = prev + amount;
      saveXP({ total: next });
      return next;
    });
    setStats((prev) => {
      const next = { ...prev, totalXP: prev.totalXP + amount };
      saveStudyStats(next);
      return next;
    });
  }, []);

  const completeSession = useCallback(async (minutes = 25) => {
    const today = todayStr();
    const hours = minutes / 60;

    // Update daily goal
    setDailyGoal((prev) => {
      const next = { ...prev, sessionsCompleted: prev.sessionsCompleted + 1, date: today };
      saveDailyGoal(next);
      return next;
    });

    // Update stats
    setStats((prev) => {
      const dow = new Date().getDay(); // 0=Sun
      const weekly = [...prev.weeklyHours];
      weekly[dow] = (weekly[dow] || 0) + hours;
      const next = { ...prev, totalSessions: prev.totalSessions + 1, weeklyHours: weekly, lastStudyDate: today };
      saveStudyStats(next);
      return next;
    });

    await addXP(20);
  }, [addXP]);

  const completeTask = useCallback(async () => {
    const today = todayStr();
    setDailyGoal((prev) => {
      const next = { ...prev, tasksCompleted: prev.tasksCompleted + 1, date: today };
      saveDailyGoal(next);
      return next;
    });
    setStats((prev) => {
      const next = { ...prev, totalTasks: prev.totalTasks + 1 };
      saveStudyStats(next);
      return next;
    });
    await addXP(10);
  }, [addXP]);

  const updateStreak = useCallback(async (streak) => {
    setStats((prev) => {
      const next = { ...prev, streak };
      saveStudyStats(next);
      return next;
    });
  }, []);

  return (
    <XPContext.Provider value={useMemo(() => ({
      totalXP, level, xpInLevel, xpProgress, xpPerLevel: XP_PER_LEVEL,
      dailyGoal, stats, addXP, completeSession, completeTask, updateStreak,
    }), [totalXP, level, xpInLevel, xpProgress, dailyGoal, stats, addXP, completeSession, completeTask, updateStreak])}>
      {children}
    </XPContext.Provider>
  );
}

export function useXP() {
  const ctx = useContext(XPContext);
  if (!ctx) throw new Error('useXP must be used inside <XPProvider>');
  return ctx;
}
