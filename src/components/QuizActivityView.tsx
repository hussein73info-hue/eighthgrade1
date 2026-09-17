/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  Edit2,
  X
} from 'lucide-react';
import { QuizQuestion, Trainee, Lesson, LessonResult } from '../types';
import { emailService } from '../services/emailService';
import { adminService } from '../services/adminService';

interface QuizActivityViewProps {
  questions: QuizQuestion[];
  trainee: Trainee;
  lesson: Lesson;
  lessonIndex: number;
  savedProgress?: LessonResult;
  onSaveProgress: (lessonIdx: number, result: LessonResult) => void;
  isAdminUnlocked: boolean;
  onEditQuestion?: (questionIdx: number) => void;
}

export const QuizActivityView: React.FC<QuizActivityViewProps> = ({
  questions,
  trainee,
  lesson,
  lessonIndex,
  savedProgress,
  onSaveProgress,
  isAdminUnlocked,
  onEditQuestion,
}) => {
  const [answers, setAnswers] = useState<Record<number, number>>(() => {
    return savedProgress?.answers || {};
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(!!savedProgress?.completed);
  const [validationError, setValidationError] = useState('');

  // Supervisor Unlock state
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Check if supervisor granted retake permission
  useEffect(() => {
    if (adminService.isRetakePermitted(trainee.id, lessonIndex)) {
      setSubmittedSuccessfully(false);
      setAnswers({});
      adminService.consumeRetakePermission(trainee.id, lessonIndex);
    }
  }, [trainee.id, lessonIndex]);

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (submittedSuccessfully) return;
    setAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
    setValidationError('');
  };

  const answeredCount = Object.keys(answers).length;
  const isAllAnswered = answeredCount === questions.length;

  const handleSubmit = async () => {
    if (!isAllAnswered) {
      setValidationError(`يرجى الإجابة عن جميع الأسئلة (${answeredCount} من ${questions.length} تمت الإجابة عنها) قبل الإرسال.`);
      return;
    }

    setIsSubmitting(true);
    setValidationError('');

    // Calculate score (kept hidden from user)
    let score = 0;
    const detailLines: string[] = [];

    questions.forEach((q, idx) => {
      const selected = answers[idx];
      const isCorrect = selected === q.correct;
      if (isCorrect) score += 1;

      const chosenText = selected !== undefined ? q.options[selected] : 'لم يُجب';
      const correctText = q.options[q.correct];
      detailLines.push(
        `السؤال ${idx + 1}: ${q.q}\n` +
        `  إجابة المتدرب: ${chosenText} (${isCorrect ? 'صحيح ✓' : 'خطأ ✗'})\n` +
        `  الإجابة النموذجية: ${correctText}\n`
      );
    });

    const answersSummary = detailLines.join('\n');

    // Send to alkam14@gmail.com and record in admin logs
    await emailService.sendResult({
      trainee,
      lesson,
      lessonIndex,
      score,
      total: questions.length,
      answersSummary,
    });

    // Save progress locally
    const result: LessonResult = {
      completed: true,
      score,
      total: questions.length,
      submittedAt: new Date().toISOString(),
      answers,
    };
    onSaveProgress(lessonIndex, result);

    setIsSubmitting(false);
    setSubmittedSuccessfully(true);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminService.verifyPassword(unlockPassword)) {
      setUnlockError('');
      setShowUnlockModal(false);
      setUnlockPassword('');
      // Reset quiz for student
      setSubmittedSuccessfully(false);
      setAnswers({});
      onSaveProgress(lessonIndex, {
        completed: false,
        score: 0,
        total: questions.length,
        answers: {},
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
                النشاط التدريبي: اختبار الفهم والتطبيق
              </h3>
              <p className="text-xs sm:text-sm text-[#1B3A3D]/70">
                اختر الإجابة الصحيحة لكل سؤال، ثم اضغط على زر الإرسال عند الانتهاء
              </p>
            </div>
          </div>

          <div className="text-xs font-bold px-3 py-1.5 bg-[#FAF7F0] border border-[#1B3A3D]/15 rounded-lg text-[#1B3A3D]">
            عدد الأسئلة: {questions.length}
          </div>
        </div>
      </div>

      {/* Submitted & Locked State (User does NOT see their score or mark) */}
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
              لقد تم إرسال وتوثيق نتائج نشاطك بنجاح إلى بريد مسؤول المادة. شكراً لك على المشاركة وإتمام النشاط.
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
        /* Questions List */
        <div className="space-y-5">
          {questions.map((q, qIdx) => {
            const isAnswered = answers[qIdx] !== undefined;

            return (
              <div
                key={qIdx}
                className={`bg-white border-2 rounded-2xl p-4 sm:p-5 transition-all shadow-xs ${
                  isAnswered ? 'border-[#1B3A3D]/25' : 'border-[#1B3A3D]/15'
                }`}
              >
                {/* Question Text */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-[#1B3A3D] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      {qIdx + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-[#1B3A3D] leading-relaxed">
                      {q.q}
                    </h4>
                  </div>

                  {onEditQuestion && (
                    <button
                      type="button"
                      onClick={() => onEditQuestion(qIdx)}
                      className="p-1.5 text-[#1B3A3D]/50 hover:text-[#1B3A3D] rounded-lg hover:bg-[#FAF7F0] transition-colors"
                      title="تحرير السؤال (محمي بكلمة مرور)"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Options List */}
                <div className="space-y-2 mr-8">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[qIdx] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectOption(qIdx, optIdx)}
                        className={`w-full text-right p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-[#1B3A3D] bg-[#1B3A3D]/10 text-[#1B3A3D] ring-2 ring-[#1B3A3D]/20 font-bold'
                            : 'border-[#1B3A3D]/15 bg-[#FAF7F0] hover:bg-white text-[#1B3A3D]/90'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                              isSelected
                                ? 'border-[#1B3A3D] bg-[#1B3A3D] text-white'
                                : 'border-[#1B3A3D]/30'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {validationError && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Single Submit Button: إرسال الإجابات */}
          <div className="pt-2">
            <button
              id="submit-quiz-btn"
              type="button"
              disabled={isSubmitting || !isAllAnswered}
              onClick={handleSubmit}
              className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-md transition-all ${
                !isAllAnswered
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
                  : !isAllAnswered
                  ? `أجب عن جميع الأسئلة (${answeredCount} من ${questions.length}) للتفعيل`
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
