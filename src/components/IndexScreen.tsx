/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lesson, Trainee, LessonResult } from '../types';
import {
  LogOut,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Search,
  GraduationCap,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { EditElementModal } from './EditElementModal';

interface IndexScreenProps {
  user: Trainee;
  lessons: Lesson[];
  progress: Record<number, LessonResult>;
  onSelectLesson: (index: number) => void;
  onLogout: () => void;
  isAdminUnlocked: boolean;
  onAdminUnlocked: () => void;
  onOpenAdminModal: () => void;
  onUpdateLesson: (lessonIndex: number, updated: Lesson) => void;
}

export const IndexScreen: React.FC<IndexScreenProps> = ({
  user,
  lessons,
  progress,
  onSelectLesson,
  onLogout,
  isAdminUnlocked,
  onAdminUnlocked,
  onOpenAdminModal,
  onUpdateLesson,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Element editing modal
  const [editingElement, setEditingElement] = useState<{
    lessonIndex: number;
    title: string;
    currentValue: string;
  } | null>(null);

  // Group lessons by unit
  const unitsMap = new Map<number, { title: string; lessons: Array<{ lesson: Lesson; index: number }> }>();

  lessons.forEach((l, idx) => {
    if (!unitsMap.has(l.unitNo)) {
      unitsMap.set(l.unitNo, { title: l.unit, lessons: [] });
    }
    unitsMap.get(l.unitNo)!.lessons.push({ lesson: l, index: idx });
  });

  const units = Array.from(unitsMap.values());

  // Filter lessons based on search
  const filteredUnits = units.map((u) => ({
    ...u,
    lessons: u.lessons.filter(
      (item) =>
        item.lesson.title.includes(searchQuery.trim()) ||
        item.lesson.unit.includes(searchQuery.trim())
    ),
  })).filter(u => u.lessons.length > 0);

  // Total completed
  const totalCompleted = (Object.values(progress) as LessonResult[]).filter((p) => p?.completed).length;

  const handleSaveTitleEdit = (newTitle: string) => {
    if (!editingElement) return;
    const currentLesson = lessons[editingElement.lessonIndex];
    if (currentLesson) {
      const updated = { ...currentLesson, title: newTitle };
      onUpdateLesson(editingElement.lessonIndex, updated);
    }
    setEditingElement(null);
  };

  return (
    <div className="w-full max-w-[820px] mx-auto min-h-screen pb-12">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-3 sm:px-5 py-3.5 border-b border-[#D9CFB4] bg-[#F6F1E7] sticky top-0 z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onLogout}
            id="indexLogoutBtn"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-[#5C7376] hover:text-[#A8432E] hover:underline font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل خروج</span>
          </button>

          <button
            type="button"
            onClick={onOpenAdminModal}
            className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
              isAdminUnlocked
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'bg-white text-[#1B3A3D] hover:bg-white/80 border border-[#D9CFB4]'
            }`}
            title="لوحة تحكم المسؤول / كلمة المرور"
          >
            <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
            <span className="hidden sm:inline">
              {isAdminUnlocked ? 'المسؤول نشط ✓' : 'المسؤول'}
            </span>
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-[#1B3A3D]">فهرس الدروس</h1>
          <span className="text-xs text-[#5C7376] font-medium hidden sm:inline">
            المتدرب/ة: {user.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-white px-2.5 sm:px-3 py-1.5 rounded-full border border-[#D9CFB4] text-xs font-bold text-[#1B3A3D] shadow-xs">
          <GraduationCap className="w-4 h-4 text-[#C99A2E]" />
          <span>{totalCompleted} / {lessons.length} منجز</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-3 sm:p-5 md:p-6 space-y-6">
        {/* Welcome card */}
        <div className="bg-gradient-to-r from-[#1B3A3D] to-[#254F53] text-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C99A2E] bg-white/10 px-2.5 py-1 rounded-md">
                كتاب الطالب والأنشطة
              </span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black mt-2 text-white">
                منهاج الثقافة المالية للصف الثامن
              </h2>
              <p className="text-xs sm:text-sm text-[#cfe0de] mt-1">
                تصفح الوحدات والدروس أدناه، واستكمل الأنشطة التدريبية لكل درس.
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-[#5C7376] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن درس أو موضوع..."
                className="w-full bg-white text-[#1B3A3D] text-xs sm:text-sm rounded-xl pr-9 pl-3 py-2 border border-[#D9CFB4] focus-visible:outline-[#C99A2E]"
              />
            </div>
          </div>
        </div>

        {/* Units list */}
        <div className="space-y-6">
          {filteredUnits.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-[#5C7376] border border-[#D9CFB4]">
              لا توجد دروس مطابقة لبحثك "{searchQuery}".
            </div>
          ) : (
            filteredUnits.map((unit) => (
              <section key={unit.title} className="space-y-3">
                {/* Unit Header Badge */}
                <div className="bg-[#B14A7A] text-white rounded-xl px-4 py-3 font-extrabold text-sm sm:text-base md:text-lg flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-white/90" />
                    <span>{unit.title}</span>
                  </div>
                  <span className="text-xs font-semibold bg-white/20 px-2.5 py-0.5 rounded-full">
                    {unit.lessons.length} دروس
                  </span>
                </div>

                {/* Lesson Rows */}
                <div className="space-y-2.5">
                  {unit.lessons.map((item, li) => {
                    const prog = progress[item.index];
                    const isDone = prog?.completed;

                    return (
                      <div
                        key={item.lesson.title + item.index}
                        id={`lessonRow_${item.index}`}
                        onClick={() => onSelectLesson(item.index)}
                        className="group flex items-center justify-between bg-white hover:bg-[#FAF7F2] border-[1.5px] border-[#D9CFB4] hover:border-[#C99A2E] rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all shadow-xs active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3">
                          {/* Lesson Number Circle */}
                          <div className="w-8 h-8 rounded-full bg-[#1E6FA6] text-white flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                            {li + 1}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base md:text-lg font-bold text-[#1B3A3D] group-hover:text-[#1E6FA6] transition-colors">
                                {item.lesson.title}
                              </h3>
                              {/* Edit title button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingElement({
                                    lessonIndex: item.index,
                                    title: 'تعديل عنوان الدرس (محمي بكلمة مرور)',
                                    currentValue: item.lesson.title,
                                  });
                                }}
                                className="p-1 text-[#1B3A3D]/40 hover:text-[#1B3A3D] rounded-md transition-colors"
                                title="تعديل هذا العنوان"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-xs text-[#5C7376]">
                              <span>
                                {item.lesson.categorization
                                  ? 'نشاط تفاعلي (تصنيف البطاقات)'
                                  : `${item.lesson.quiz?.length || 5} أسئلة تدريبية`}
                              </span>

                              {/* Completed Badge - User does NOT see score or mark */}
                              {isDone && (
                                <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                  <span>تم تسليم النشاط ✓</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[#5C7376] group-hover:text-[#1B3A3D] group-hover:-translate-x-1 transition-transform">
                          <span className="text-xs font-semibold hidden sm:inline text-[#1E6FA6]">عرض الدرس</span>
                          <ChevronLeft className="w-5 h-5 text-[#1E6FA6]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingElement && (
        <EditElementModal
          isOpen={!!editingElement}
          title={editingElement.title}
          currentValue={editingElement.currentValue}
          isAdminUnlocked={isAdminUnlocked}
          onAdminUnlocked={onAdminUnlocked}
          onSave={handleSaveTitleEdit}
          onClose={() => setEditingElement(null)}
        />
      )}
    </div>
  );
};
