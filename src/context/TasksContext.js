import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { TASKS as SEED_TASKS } from '../constants/tasks';
import { getStoredTasks, saveStoredTasks } from '../services/storage';

const TasksContext = createContext(null);

/*
 TasksProvider manages the application's task state.
 It loads saved tasks, stores updates, and provides
 CRUD operations (Create, Read, Update, Delete) to
 all components. 
 */
/*
Seed refers to the initial data.Imports the application's predefined task list. These tasks are used
when the user has no saved data at the start.
*/
export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getStoredTasks().then((stored) => {
      if (stored === null) {
        setTasks(SEED_TASKS);
        saveStoredTasks(SEED_TASKS);
      } else {
        setTasks(stored);
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((newTasks) => {
    setTasks(newTasks);
    saveStoredTasks(newTasks);
  }, []);

  const addTask = useCallback((task) => {
    const newTask = {
      id:        `t_${Date.now()}`,
      completed: false,
      filter:    task.filter || 'today',
      ...task,
    };
    persist([newTask, ...tasks]);
    return newTask;
  }, [tasks, persist]);

  const updateTask = useCallback((id, updates) => {
    persist(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, [tasks, persist]);

  const deleteTask = useCallback((id) => {
    persist(tasks.filter((t) => t.id !== id));
  }, [tasks, persist]);

  const toggleComplete = useCallback((id) => {
    persist(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed, filter: !t.completed ? 'done' : 'today' } : t)));
  }, [tasks, persist]);

  const getTaskById = useCallback((id) => tasks.find((t) => t.id === id), [tasks]);

  // Without this, every re-render of TasksProvider (which wraps the whole
  // app) would hand consumers a brand-new object identity even when nothing
  // they actually read changed — forcing every useTasks() consumer to
  // re-render along with it.
  const value = useMemo(() => (
    { tasks, loaded, addTask, updateTask, deleteTask, toggleComplete, getTaskById }
  ), [tasks, loaded, addTask, updateTask, deleteTask, toggleComplete, getTaskById]);

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used inside <TasksProvider>');
  return ctx;
}
