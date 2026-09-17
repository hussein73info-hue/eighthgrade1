/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Trainee, ScreenType, LessonResult, Lesson } from './types';
import { LoginScreen } from './components/LoginScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { IndexScreen } from './components/IndexScreen';
import { LessonScreen } from './components/LessonScreen';
import { AdminModal } from './components/AdminModal';
import { adminService } from './services/adminService';
import { ShieldCheck } from 'lucide-react';

const STORAGE_KEY_USER = 'fin_lit_user_v1';
const STORAGE_KEY_PROGRESS = 'fin_lit_progress_v1';

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('login');
  const [user, setUser] = useState<Trainee | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => adminService.getLessons());
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);

  // Admin Supervisor State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

  const [progress, setProgress] = useState<Record<number, LessonResult>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // On initial load, if user is already saved, go to index
  useEffect(() => {
    if (user && screen === 'login') {
      setScreen('index');
    }
  }, [user]);

  const handleLogin = (trainee: Trainee) => {
    setUser(trainee);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(trainee));
    } catch (e) {
      console.error(e);
    }
    setScreen('welcome');
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch (e) {
      console.error(e);
    }
    setScreen('login');
  };

  const handleSelectLesson = (index: number) => {
    setCurrentLessonIndex(index);
    setScreen('lesson');
  };

  const handleSaveProgress = (lessonIdx: number, result: LessonResult) => {
    setProgress((prev) => {
      const updated = {
        ...prev,
        [lessonIdx]: result,
      };
      try {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleUpdateLesson = (lessonIdx: number, updated: Lesson) => {
    const updatedLessons = [...lessons];
    updatedLessons[lessonIdx] = updated;
    setLessons(updatedLessons);
    adminService.saveLesson(lessonIdx, updated);
  };

  const handleLessonsReset = () => {
    setLessons(adminService.getLessons());
  };

  return (
    <div className="min-h-screen bg-[#F6F1E7] text-[#1B3A3D] flex flex-col font-['Tajawal',sans-serif] relative">
      {/* Global Quick Admin Trigger for Login / Welcome Screen */}
      {(screen === 'login' || screen === 'welcome') && (
        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          className="fixed bottom-4 left-4 z-40 bg-[#1B3A3D] text-white hover:bg-[#254F53] px-3.5 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 border border-[#C9A96E]/40 transition-all hover:scale-105 active:scale-95"
          title="دخول المسؤول / المشرف"
        >
          <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
          <span>لوحة المسؤول</span>
        </button>
      )}

      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}

      {screen === 'welcome' && user && (
        <WelcomeScreen
          user={user}
          onEnter={() => setScreen('index')}
          onLogout={handleLogout}
        />
      )}

      {screen === 'index' && user && (
        <IndexScreen
          user={user}
          lessons={lessons}
          progress={progress}
          onSelectLesson={handleSelectLesson}
          onLogout={handleLogout}
          isAdminUnlocked={isAdminUnlocked}
          onAdminUnlocked={() => setIsAdminUnlocked(true)}
          onOpenAdminModal={() => setShowAdminModal(true)}
          onUpdateLesson={handleUpdateLesson}
        />
      )}

      {screen === 'lesson' && user && (
        <LessonScreen
          lessonIndex={currentLessonIndex}
          lesson={lessons[currentLessonIndex] || adminService.getLessons()[currentLessonIndex]}
          totalLessons={lessons.length}
          trainee={user}
          savedProgress={progress[currentLessonIndex]}
          onSaveProgress={handleSaveProgress}
          onUpdateLesson={handleUpdateLesson}
          onBackToIndex={() => setScreen('index')}
          onNavigateLesson={handleSelectLesson}
          isAdminUnlocked={isAdminUnlocked}
          onAdminUnlocked={() => setIsAdminUnlocked(true)}
          onOpenAdminModal={() => setShowAdminModal(true)}
        />
      )}

      {/* Supervisor Admin Modal */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        isAdminUnlocked={isAdminUnlocked}
        onAdminUnlocked={() => setIsAdminUnlocked(true)}
        onLessonsReset={handleLessonsReset}
      />
    </div>
  );
}
