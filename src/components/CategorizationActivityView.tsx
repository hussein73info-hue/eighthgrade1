/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Target,
  Sliders,
  Send,
  CheckCircle2,
  Lock,
  Unlock,
  HelpCircle,
  X,
  Sparkles,
  ArrowDownCircle,
  RotateCcw
} from 'lucide-react';
import { CategorizationActivity, Trainee, Lesson, LessonResult } from '../types';
import { emailService } from '../services/emailService';
import { adminService } from '../services/adminService';

interface CategorizationActivityViewProps {
  activity: CategorizationActivity;
  trainee: Trainee;
  lesson: Lesson;
  lessonIndex: number;
  savedProgress?: LessonResult;
  onSaveProgress: (lessonIdx: number, result: LessonResult) => void;
  isAdminUnlocked: boolean;
  onOpenAdmin: () => void;
}

export const CategorizationActivityView: React.FC<CategorizationActivityViewProps> = ({
  activity,
  trainee,
  lesson,
  lessonIndex,
  savedProgress,
  onSaveProgress,
  isAdminUnlocked,
  onOpenAdmin,
}) => {
  // All 9 items
  const allItems = [
    ...activity.category1.items,
    ...activity.category2.items,
  ];

  // Placements: map itemId -> 'importance' | 'methods'
  const [placements, setPlacements] = useState<Record<string, 'importance' | 'methods'>>(() => {
    if (savedProgress?.categorizationAnswers) {
      return savedProgress.categorizationAnswers;
    }
    return {};
  });

  // Currently selected item for touch-based mobile placing
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(!!savedProgress?.completed);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Check if retake is permitted from admin service
  useEffect(() => {
    if (adminService.isRetakePermitted(trainee.id, lessonIndex)) {
      setSubmittedSuccessfully(false);
      setPlacements({});
      adminService.consumeRetakePermission(trainee.id, lessonIndex);
    }
  }, [trainee.id, lessonIndex]);

  // Derived lists
  const assignedKeys = Object.keys(placements);
  const unassignedItems = allItems.filter((item) => !assignedKeys.includes(item));
  const category1Items = allItems.filter((item) => placements[item] === 'importance');
  const category2Items = allItems.filter((item) => placements[item] === 'methods');

  const handlePlaceItem = (item: string, targetCategory: 'importance' | 'methods') => {
    if (submittedSuccessfully) return;
    setPlacements((prev) => ({
      ...prev,
      [item]: targetCategory,
    }));
    if (selectedItem === item) {
      setSelectedItem(null);
    }
  };

  const handleRemoveItem = (item: string) => {
    if (submittedSuccessfully) return;
    setPlacements((prev) => {
      const updated = { ...prev };
      delete updated[item];
      return updated;
    });
    if (selectedItem === item) {
      setSelectedItem(null);
    }
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, item: string) => {
    e.dataTransfer.setData('text/plain', item);
  };

  const handleDropOnCategory = (e: React.DragEvent, targetCategory: 'importance' | 'methods') => {
    e.preventDefault();
    const item = e.dataTransfer.getData('text/plain');
    if (item && allItems.includes(item)) {
      handlePlaceItem(item, targetCategory);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Submission
  const handleSubmit = async () => {
    if (unassignedItems.length > 0) {
      alert(`يرجى تصنيف جميع البطاقات (متبقي ${unassignedItems.length} بطاقة) قبل الإرسال.`);
      return;
    }

    setIsSubmitting(true);

    // Calculate score accurately (invisible to trainee)
    let score = 0;
    const total = allItems.length; // 9
    const detailLines: string[] = [];

    // Check importance items
    activity.category1.items.forEach((item) => {
      const chosen = placements[item];
      const isCorrect = chosen === 'importance';
      if (isCorrect) score += 1;
      detailLines.push(
        `- «${item}»: وضعها المتدرب في [${chosen === 'importance' ? activity.category1.title : activity.category2.title}] (${isCorrect ? 'صحيح ✓' : 'خطأ ✗'})`
      );
    });

    // Check methods items
    activity.category2.items.forEach((item) => {
      const chosen = placements[item];
      const isCorrect = chosen === 'methods';
      if (isCorrect) score += 1;
      detailLines.push(
        `- «${item}»: وضعها المتدرب في [${chosen === 'importance' ? activity.category1.title : activity.category2.title}] (${isCorrect ? 'صحيح ✓' : 'خطأ ✗'})`
      );
    });

    const answersSummary = `تصنيف بطاقات التخطيط المالي (9 بطاقات):\n${detailLines.join('\n')}`;

    // Send to alkam14@gmail.com and record in admin logs
    await emailService.sendResult({
      trainee,
      lesson,
      lessonIndex,
      score,
      total,
      answersSummary,
    });

    // Save progress locally as completed
    const result: LessonResult = {
      completed: true,
      score,
      total,
      submittedAt: new Date().toISOString(),
      categorizationAnswers: placements,
    };
    onSaveProgress(lessonIndex, result);

    setIsSubmitting(false);
    setSubmittedSuccessfully(true);
  };

  // Admin Unlock logic
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminService.verifyPassword(unlockPassword)) {
      setUnlockError('');
      setShowUnlockModal(false);
      setUnlockPassword('');
      // Reset activity for retake
      setSubmittedSuccessfully(false);
      setPlacements({});
      onSaveProgress(lessonIndex, {
        completed: false,
        score: 0,
        total: allItems.length,
        answers: {},
        categorizationAnswers: {},
      });
      alert('تم منح إذن إعادة المحاولة بنجاح.');
    } else {
      setUnlockError('كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity Card Header */}
      <div className="bg-white border-2 border-[#1B3A3D]/15 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/20 text-[#1B3A3D] flex items-center justify-center font-bold">
              ✏️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1B3A3D]">
                النشاط التدريبي: تصنيف عناصر التخطيط المالي
              </h3>
              <p className="text-xs sm:text-sm text-[#1B3A3D]/70">
                صنّف البطاقات التالية بوضع كل بطاقة تحت الأيقونة المناسبة لها
              </p>
            </div>
          </div>

          <div className="text-xs font-bold px-3 py-1.5 bg-[#FAF7F0] border border-[#1B3A3D]/15 rounded-lg text-[#1B3A3D]">
            إجمالي البطاقات: {allItems.length}
          </div>
        </div>

        {/* Instructions banner */}
        <div className="mt-4 bg-[#FAF7F0] border border-[#1B3A3D]/10 rounded-xl p-3 text-xs text-[#1B3A3D]/80 flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-[#C9A96E] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>طريقة الاستخدام على الجوال:</strong> انقر على أي بطاقة لاختيارها، ثم انقر على الصندوق المناسب لوضعها، أو استخدم أزرار النقل السريع الموجودة على كل بطاقة.
          </div>
        </div>
      </div>

      {/* Submitted & Locked State */}
      {submittedSuccessfully ? (
        <div className="bg-white border-2 border-emerald-600/30 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm animate-in fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h4 className="text-lg sm:text-xl font-bold text-emerald-900">
              تم إرسال إجاباتك بنجاح
            </h4>
            <p className="text-xs sm:text-sm text-[#1B3A3D]/80 max-w-md mx-auto leading-relaxed">
              لقد تم إرسال وتوثيق نتائج نشاطك بنجاح إلى بريد مسؤول المادة. شكراً لاهتمامك وإتمامك للنشاط التدريبي.
            </p>
          </div>

          {/* Locked notice & Admin Unlock Button */}
          <div className="pt-4 border-t border-[#1B3A3D]/10 max-w-sm mx-auto space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#1B3A3D]/70 bg-[#FAF7F0] p-2.5 rounded-xl border border-[#1B3A3D]/15">
              <Lock className="w-4 h-4 text-[#C9A96E]" />
              <span>هذا النشاط مقفل ولا يمكن إعادة المحاولة إلا بإذن المسؤول</span>
            </div>

            <button
              type="button"
              onClick={() => setShowUnlockModal(true)}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#1B3A3D] hover:text-[#C9A96E] underline py-1 transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              إذن إعادة التقديم (خاص بالمسؤول)
            </button>
          </div>
        </div>
      ) : (
        /* Active Interactive Sorting Area */
        <div className="space-y-6">
          {/* Two Main Category Drop Zones (The Two Primary Icons) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category 1: أهمية التخطيط المالي */}
            <div
              id="category-importance-box"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnCategory(e, 'importance')}
              onClick={() => {
                if (selectedItem) {
                  handlePlaceItem(selectedItem, 'importance');
                }
              }}
              className={`border-2 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer ${
                selectedItem
                  ? 'border-dashed border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                  : 'border-[#1B3A3D]/25 bg-white shadow-xs hover:border-[#1B3A3D]/40'
              }`}
            >
              {/* Category 1 Header with Icon */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1B3A3D]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#1B3A3D] text-[#C9A96E] flex items-center justify-center shadow-xs">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-[#1B3A3D]">
                      {activity.category1.title}
                    </h4>
                    <p className="text-[11px] text-[#1B3A3D]/60">الأيقونة الأولى</p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 bg-[#1B3A3D]/10 text-[#1B3A3D] rounded-full">
                  {category1Items.length} بطاقات
                </span>
              </div>

              {/* Items Placed in Category 1 */}
              <div className="mt-3 min-h-[140px] space-y-2">
                {category1Items.length === 0 ? (
                  <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#1B3A3D]/20 rounded-xl text-xs text-[#1B3A3D]/50">
                    <ArrowDownCircle className="w-6 h-6 mb-1 text-[#1B3A3D]/30" />
                    <span>ضع البطاقات التابعة لأهمية التخطيط المالي هنا</span>
                  </div>
                ) : (
                  category1Items.map((item) => (
                    <div
                      key={item}
                      className="bg-[#FAF7F0] border border-[#1B3A3D]/20 p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-[#1B3A3D]/40 transition-colors animate-in fade-in"
                    >
                      <span className="text-xs font-semibold text-[#1B3A3D] leading-snug">
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item);
                        }}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                        title="إزالة من هذه الأيقونة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {selectedItem && (
                <div className="mt-2 text-center text-xs font-bold text-teal-700 bg-teal-100/70 py-1.5 rounded-lg animate-pulse">
                  اضغط هنا لوضع «{selectedItem}»
                </div>
              )}
            </div>

            {/* Category 2: طرائق التحكم في النفقات */}
            <div
              id="category-methods-box"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropOnCategory(e, 'methods')}
              onClick={() => {
                if (selectedItem) {
                  handlePlaceItem(selectedItem, 'methods');
                }
              }}
              className={`border-2 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer ${
                selectedItem
                  ? 'border-dashed border-[#C9A96E] bg-amber-50/50 ring-2 ring-[#C9A96E]/20'
                  : 'border-[#1B3A3D]/25 bg-white shadow-xs hover:border-[#1B3A3D]/40'
              }`}
            >
              {/* Category 2 Header with Icon */}
              <div className="flex items-center justify-between pb-3 border-b border-[#1B3A3D]/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#C9A96E] text-[#1B3A3D] flex items-center justify-center shadow-xs">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-[#1B3A3D]">
                      {activity.category2.title}
                    </h4>
                    <p className="text-[11px] text-[#1B3A3D]/60">الأيقونة الثانية</p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 bg-[#C9A96E]/25 text-[#1B3A3D] rounded-full">
                  {category2Items.length} بطاقات
                </span>
              </div>

              {/* Items Placed in Category 2 */}
              <div className="mt-3 min-h-[140px] space-y-2">
                {category2Items.length === 0 ? (
                  <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#1B3A3D]/20 rounded-xl text-xs text-[#1B3A3D]/50">
                    <ArrowDownCircle className="w-6 h-6 mb-1 text-[#1B3A3D]/30" />
                    <span>ضع البطاقات التابعة لطرائق التحكم في النفقات هنا</span>
                  </div>
                ) : (
                  category2Items.map((item) => (
                    <div
                      key={item}
                      className="bg-[#FAF7F0] border border-[#1B3A3D]/20 p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-[#1B3A3D]/40 transition-colors animate-in fade-in"
                    >
                      <span className="text-xs font-semibold text-[#1B3A3D] leading-snug">
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item);
                        }}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                        title="إزالة من هذه الأيقونة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {selectedItem && (
                <div className="mt-2 text-center text-xs font-bold text-amber-800 bg-amber-100/70 py-1.5 rounded-lg animate-pulse">
                  اضغط هنا لوضع «{selectedItem}»
                </div>
              )}
            </div>
          </div>

          {/* Unassigned Items Pool */}
          <div className="bg-white border border-[#1B3A3D]/20 rounded-2xl p-4 sm:p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C9A96E]" />
                <h4 className="font-bold text-sm text-[#1B3A3D]">
                  البطاقات المطلوب تصنيفها ({unassignedItems.length} متبقية)
                </h4>
              </div>

              {assignedKeys.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPlacements({})}
                  className="text-xs text-[#1B3A3D]/60 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  إعادة ضبط الكل
                </button>
              )}
            </div>

            {unassignedItems.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>رائع! تم تصنيف جميع البطاقات بنجاح. يمكنك الآن الضغط على زر الإرسال أدناه.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {unassignedItems.map((item) => {
                  const isSelected = selectedItem === item;
                  return (
                    <div
                      key={item}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => setSelectedItem(isSelected ? null : item)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? 'border-[#C9A96E] bg-amber-50/80 shadow-md ring-2 ring-[#C9A96E]/40'
                          : 'border-[#1B3A3D]/15 bg-[#FAF7F0] hover:border-[#1B3A3D]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[#1B3A3D] leading-snug">
                          {item}
                        </span>
                        <span className="text-[10px] text-[#1B3A3D]/40 font-mono shrink-0">
                          اسحب أو اختر
                        </span>
                      </div>

                      {/* Mobile quick action buttons on card for maximum touchscreen convenience */}
                      <div className="flex items-center gap-1.5 pt-1 border-t border-[#1B3A3D]/10">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaceItem(item, 'importance');
                          }}
                          className="flex-1 py-1.5 px-2 bg-[#1B3A3D]/10 hover:bg-[#1B3A3D] hover:text-white text-[#1B3A3D] rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <Target className="w-3 h-3 text-[#C9A96E]" />
                          <span>أهمية التخطيط</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaceItem(item, 'methods');
                          }}
                          className="flex-1 py-1.5 px-2 bg-[#C9A96E]/20 hover:bg-[#C9A96E] hover:text-[#1B3A3D] text-[#1B3A3D] rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <Sliders className="w-3 h-3 text-[#1B3A3D]" />
                          <span>طرائق التحكم</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Single Submit Button: إرسال الإجابات */}
          <div className="pt-2">
            <button
              id="submit-categorization-btn"
              type="button"
              disabled={isSubmitting || unassignedItems.length > 0}
              onClick={handleSubmit}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-md transition-all ${
                unassignedItems.length > 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isSubmitting
                  ? 'bg-[#1B3A3D]/80 text-white cursor-wait'
                  : 'bg-[#1B3A3D] hover:bg-[#264e52] text-[#F6F1E7] active:scale-[0.99]'
              }`}
            >
              <Send className="w-5 h-5" />
              <span>
                {isSubmitting
                  ? 'جارٍ إرسال الإجابات إلى المسؤول...'
                  : unassignedItems.length > 0
                  ? `صنّف باقي البطاقات (${unassignedItems.length}) للتفعيل`
                  : 'إرسال الإجابات'}
              </span>
            </button>
            <p className="text-center text-[11px] text-[#1B3A3D]/60 mt-2">
              تُرسل الإجابات مباشرة ومحفوظة لدى مسؤول المادة
            </p>
          </div>
        </div>
      )}

      {/* Admin Unlock Retake Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FAF7F0] border-2 border-[#1B3A3D]/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#C9A96E]" />
                <h4 className="font-bold text-sm text-[#1B3A3D]">إذن إعادة التقديم للمسؤول</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowUnlockModal(false)}
                className="text-[#1B3A3D]/60 hover:text-[#1B3A3D] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#1B3A3D]/70 leading-relaxed">
              أدخل كلمة مرور المسؤول للسماح للمتدرب/ة: <strong>{trainee.name}</strong> بإعادة تقديم هذا النشاط.
            </p>

            <form onSubmit={handleUnlockSubmit} className="space-y-3">
              <input
                type="password"
                value={unlockPassword}
                onChange={(e) => {
                  setUnlockPassword(e.target.value);
                  setUnlockError('');
                }}
                placeholder="كلمة مرور المسؤول"
                className="w-full px-3.5 py-2.5 bg-white border border-[#1B3A3D]/25 rounded-xl text-center text-sm font-bold tracking-wider focus:ring-2 focus:ring-[#1B3A3D] focus:outline-hidden"
                autoFocus
              />

              {unlockError && (
                <div className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200 text-center">
                  {unlockError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="px-3 py-2 text-xs font-medium text-[#1B3A3D]/70"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  السماح بالإعادة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
