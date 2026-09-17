/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lesson, LessonResult, Trainee } from '../types';
import { CategorizationActivityView } from './CategorizationActivityView';
import { QuizActivityView } from './QuizActivityView';
import { EditElementModal } from './EditElementModal';
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Search,
  Edit2,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface LessonScreenProps {
  lessonIndex: number;
  lesson: Lesson;
  totalLessons: number;
  trainee: Trainee;
  savedProgress?: LessonResult;
  onSaveProgress: (lessonIndex: number, result: LessonResult) => void;
  onUpdateLesson: (lessonIndex: number, updated: Lesson) => void;
  onBackToIndex: () => void;
  onNavigateLesson: (newIndex: number) => void;
  isAdminUnlocked: boolean;
  onAdminUnlocked: () => void;
  onOpenAdminModal: () => void;
}

export const LessonScreen: React.FC<LessonScreenProps> = ({
  lessonIndex,
  lesson,
  totalLessons,
  trainee,
  savedProgress,
  onSaveProgress,
  onUpdateLesson,
  onBackToIndex,
  onNavigateLesson,
  isAdminUnlocked,
  onAdminUnlocked,
  onOpenAdminModal,
}) => {
  // Editing state
  const [editingTarget, setEditingTarget] = useState<{
    type: 'title' | 'discover' | 'learn_item' | 'new_learn_item' | 'question';
    index?: number;
    initialValue: string;
    title: string;
    multiline?: boolean;
  } | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lessonIndex]);

  // Handle saving an edited element
  const handleSaveEdit = (newValue: string) => {
    if (!editingTarget) return;

    const updated = { ...lesson };

    if (editingTarget.type === 'title') {
      updated.title = newValue;
    } else if (editingTarget.type === 'discover') {
      updated.discover = newValue;
    } else if (editingTarget.type === 'learn_item' && editingTarget.index !== undefined) {
      const items = [...updated.learn];
      items[editingTarget.index] = newValue;
      updated.learn = items;
    } else if (editingTarget.type === 'new_learn_item') {
      updated.learn = [...updated.learn, newValue];
    }

    onUpdateLesson(lessonIndex, updated);
    setEditingTarget(null);
  };

  const handleDeleteLearnItem = (idx: number) => {
    if (!isAdminUnlocked) {
      alert('يجب تفعيل وضع المسؤول أولاً لحذف العناصر');
      return;
    }
    if (window.confirm('هل تريد حذف هذه النقطة؟')) {
      const updated = { ...lesson };
      updated.learn = updated.learn.filter((_, i) => i !== idx);
      onUpdateLesson(lessonIndex, updated);
    }
  };

  return (
    <div className="w-full max-w-[820px] mx-auto min-h-screen pb-16">
      {/* Top Header */}
      <header className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-[#D9CFB4] bg-[#F6F1E7] sticky top-0 z-20">
        <button
          onClick={onBackToIndex}
          id="backToIndexBtn"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#1B3A3D] hover:text-[#1E6FA6] transition-colors py-1 px-2.5 rounded-lg hover:bg-white/60"
        >
          <ChevronRight className="w-5 h-5 text-[#1E6FA6]" />
          <span>الفهرس</span>
        </button>

        <div className="text-center px-2 flex-1 max-w-[280px] sm:max-w-md">
          <span className="text-[11px] font-bold text-[#5C7376] block truncate">
            {lesson.unit}
          </span>
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-sm sm:text-base md:text-lg font-black text-[#1B3A3D] truncate">
              {lesson.title}
            </h1>
            {/* Edit button for lesson title */}
            <button
              type="button"
              onClick={() =>
                setEditingTarget({
                  type: 'title',
                  initialValue: lesson.title,
                  title: 'تعديل عنوان الدرس (محمي بكلمة مرور)',
                })
              }
              className="p-1 text-[#1B3A3D]/40 hover:text-[#1B3A3D] rounded-md transition-colors"
              title="تعديل عنوان الدرس (محمي بكلمة مرور)"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Nav Controls & Admin Trigger */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onOpenAdminModal}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
              isAdminUnlocked
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-white/80 text-[#1B3A3D] hover:bg-white'
            }`}
            title="لوحة تحكم المسؤول / كلمة المرور"
          >
            <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
            <span className="hidden sm:inline">
              {isAdminUnlocked ? 'المسؤول ✓' : 'المسؤول'}
            </span>
          </button>

          <div className="flex items-center bg-white/70 rounded-lg p-0.5 border border-[#D9CFB4]">
            <button
              disabled={lessonIndex === 0}
              onClick={() => onNavigateLesson(lessonIndex - 1)}
              title="الدرس السابق"
              className="p-1 rounded-md text-[#1B3A3D] hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-[#5C7376] px-1.5">
              {lessonIndex + 1}/{totalLessons}
            </span>
            <button
              disabled={lessonIndex === totalLessons - 1}
              onClick={() => onNavigateLesson(lessonIndex + 1)}
              title="الدرس التالي"
              className="p-1 rounded-md text-[#1B3A3D] hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-3 sm:p-5 md:p-6 space-y-6">
        {/* Section 1: أستكشف (Discover) */}
        <section
          id="boxDiscover"
          className="bg-[#E7F3FA] border-[1.5px] border-[#BFE0F0] rounded-2xl p-4 sm:p-6 shadow-xs relative group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-extrabold text-base sm:text-lg text-[#1E6FA6]">
              <Search className="w-5 h-5" />
              <h2>أستكشف</h2>
            </div>
            {/* Edit button for discover section */}
            <button
              type="button"
              onClick={() =>
                setEditingTarget({
                  type: 'discover',
                  initialValue: lesson.discover,
                  title: 'تعديل نص أستكشف (محمي بكلمة مرور)',
                  multiline: true,
                })
              }
              className="p-1.5 text-[#1E6FA6]/60 hover:text-[#1E6FA6] hover:bg-white/60 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="تعديل قصة أستكشف (محمي بكلمة مرور)"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تعديل</span>
            </button>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-[#1B3A3D] font-normal whitespace-pre-wrap">
            {lesson.discover}
          </p>
        </section>

        {/* Section 2: أتعلم (Learn) */}
        <section
          id="boxLearn"
          className="bg-white border-[1.5px] border-[#D9CFB4] rounded-2xl p-4 sm:p-6 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#D9CFB4]/60">
            <div className="flex items-center gap-2 font-extrabold text-base sm:text-lg text-[#1B3A3D]">
              <BookOpen className="w-5 h-5 text-[#C99A2E]" />
              <h2>أتعلم</h2>
            </div>

            {/* Add new point button */}
            <button
              type="button"
              onClick={() =>
                setEditingTarget({
                  type: 'new_learn_item',
                  initialValue: '',
                  title: 'إضافة نقطة تعليمية جديدة (محمي بكلمة مرور)',
                  multiline: true,
                })
              }
              className="p-1.5 text-[#1B3A3D]/70 hover:text-[#1B3A3D] hover:bg-[#FAF7F0] rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
              title="إضافة نقطة جديدة"
            >
              <Plus className="w-4 h-4 text-[#C99A2E]" />
              <span>إضافة نقطة</span>
            </button>
          </div>

          <div className="space-y-3">
            {lesson.learn.map((item, idx) => {
              const parts = item.split(':', 2);
              return (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-2 p-2 rounded-xl hover:bg-[#FAF7F0]/80 transition-colors group"
                >
                  <div className="flex items-start gap-2.5 text-xs sm:text-base text-[#1B3A3D] leading-relaxed flex-1">
                    <span className="text-[#C99A2E] font-black text-base leading-none mt-1 shrink-0">
                      ●
                    </span>
                    <div className="flex-1">
                      {parts.length === 2 ? (
                        <>
                          <strong className="font-bold text-[#1B3A3D]">{parts[0]}:</strong>
                          <span>{parts[1]}</span>
                        </>
                      ) : (
                        <span>{item}</span>
                      )}
                    </div>
                  </div>

                  {/* Edit & delete buttons for each bullet */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingTarget({
                          type: 'learn_item',
                          index: idx,
                          initialValue: item,
                          title: `تعديل النقطة رقم ${idx + 1} (محمي بكلمة مرور)`,
                          multiline: true,
                        })
                      }
                      className="p-1 text-[#1B3A3D]/40 hover:text-[#1B3A3D] rounded-md transition-colors"
                      title="تعديل هذا العنصر"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {isAdminUnlocked && (
                      <button
                        type="button"
                        onClick={() => handleDeleteLearnItem(idx)}
                        className="p-1 text-red-400 hover:text-red-600 rounded-md transition-colors"
                        title="حذف هذا العنصر"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Training Activity (Categorization for Lesson 2, or Standard Quiz for other lessons) */}
        <section id="boxActivity">
          {lesson.categorization ? (
            <CategorizationActivityView
              activity={lesson.categorization}
              trainee={trainee}
              lesson={lesson}
              lessonIndex={lessonIndex}
              savedProgress={savedProgress}
              onSaveProgress={onSaveProgress}
              isAdminUnlocked={isAdminUnlocked}
              onOpenAdmin={onOpenAdminModal}
            />
          ) : lesson.quiz ? (
            <QuizActivityView
              questions={lesson.quiz}
              trainee={trainee}
              lesson={lesson}
              lessonIndex={lessonIndex}
              savedProgress={savedProgress}
              onSaveProgress={onSaveProgress}
              isAdminUnlocked={isAdminUnlocked}
            />
          ) : null}
        </section>

        {/* Bottom Navigation */}
        <footer className="pt-4 flex items-center justify-between border-t border-[#D9CFB4]/80">
          {lessonIndex > 0 ? (
            <button
              onClick={() => onNavigateLesson(lessonIndex - 1)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1B3A3D] bg-white border border-[#D9CFB4] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-[#FAF7F2] transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[#1E6FA6]" />
              <span>الدرس السابق</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={onBackToIndex}
            className="text-xs sm:text-sm font-bold text-[#5C7376] hover:text-[#1B3A3D] underline px-2 py-1.5"
          >
            العودة للفهرس
          </button>

          {lessonIndex < totalLessons - 1 ? (
            <button
              onClick={() => onNavigateLesson(lessonIndex + 1)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-[#1B3A3D] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-[#152e30] transition-colors"
            >
              <span>الدرس التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onBackToIndex}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-emerald-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl hover:bg-emerald-800 transition-colors"
            >
              <span>إنهاء والعودة للفهرس</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </footer>
      </main>

      {/* Password-protected Edit Element Modal */}
      {editingTarget && (
        <EditElementModal
          isOpen={!!editingTarget}
          title={editingTarget.title}
          currentValue={editingTarget.initialValue}
          multiline={editingTarget.multiline}
          isAdminUnlocked={isAdminUnlocked}
          onAdminUnlocked={onAdminUnlocked}
          onSave={handleSaveEdit}
          onClose={() => setEditingTarget(null)}
        />
      )}
    </div>
  );
};
