/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  X,
  Key,
  FileSpreadsheet,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  UserCheck,
  Calendar,
  Award
} from 'lucide-react';
import { adminService } from '../services/adminService';
import { SubmissionRecord } from '../types';
import { ROSTER } from '../data/roster';
import { LESSONS } from '../data/lessons';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminUnlocked: boolean;
  onAdminUnlocked: () => void;
  onLessonsReset?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdminUnlocked,
  onAdminUnlocked,
  onLessonsReset
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'submissions' | 'unlock' | 'settings'>('submissions');

  // Submissions state
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [searchFilter, setSearchFilter] = useState('');

  // Unlock state
  const [selectedTraineeId, setSelectedTraineeId] = useState(ROSTER[0]?.id || '');
  const [selectedLessonIdx, setSelectedLessonIdx] = useState<number>(0);
  const [unlockSuccessMsg, setUnlockSuccessMsg] = useState('');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState('');
  const [pwdErrorMsg, setPwdErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && isAdminUnlocked) {
      setSubmissions(adminService.getSubmissions());
    }
  }, [isOpen, isAdminUnlocked]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminService.verifyPassword(passwordInput)) {
      setLoginError('');
      onAdminUnlocked();
      setSubmissions(adminService.getSubmissions());
    } else {
      setLoginError('كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى');
    }
  };

  const handleGrantUnlock = () => {
    if (!selectedTraineeId) return;
    adminService.grantRetakePermission(selectedTraineeId, selectedLessonIdx);
    const trainee = ROSTER.find(t => t.id === selectedTraineeId);
    const lesson = LESSONS[selectedLessonIdx];
    setUnlockSuccessMsg(`تم منح إذن إعادة النشاط بنجاح للمتدرب/ة: ${trainee?.name || selectedTraineeId} في درس: ${lesson?.title || ''}`);
    setTimeout(() => setUnlockSuccessMsg(''), 4000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdErrorMsg('');
    setPwdSuccessMsg('');

    if (newPassword.length < 3) {
      setPwdErrorMsg('يجب أن تتكون كلمة المرور من 3 خانات على الأقل');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdErrorMsg('كلمتا المرور غير متطابقتين');
      return;
    }

    adminService.setAdminPassword(newPassword);
    setPwdSuccessMsg('تم تحديث كلمة مرور المسؤول بنجاح');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPwdSuccessMsg(''), 3000);
  };

  const handleResetLessons = () => {
    if (window.confirm('هل أنت متأكد من إعادة جميع نصوص ودروس الكتاب إلى النسخة الأصلية؟')) {
      adminService.resetLessonsToDefault();
      if (onLessonsReset) onLessonsReset();
      alert('تمت استعادة محتويات الدروس الأصلية بنجاح.');
    }
  };

  const handleClearSubmissions = () => {
    if (window.confirm('هل تريد مسح سجل النتائج بالكامل من جهازك؟')) {
      adminService.clearSubmissions();
      setSubmissions([]);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const q = searchFilter.toLowerCase();
    return (
      s.traineeName.toLowerCase().includes(q) ||
      s.traineeId.includes(q) ||
      s.lessonTitle.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FAF7F0] border-2 border-[#1B3A3D]/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#1B3A3D]">
        {/* Header */}
        <div className="bg-[#1B3A3D] text-[#F6F1E7] px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#C9A96E]" />
            <div>
              <h2 className="font-bold text-lg">لوحة تحكم المسؤول / المشرف</h2>
              <p className="text-xs text-[#C9A96E]">إدارة المحتوى، نتائج المتدربين، وصلاحيات الإعادة</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#F6F1E7]/70 hover:text-white transition-colors p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAdminUnlocked ? (
          /* Login Screen for Admin */
          <form onSubmit={handleLogin} className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#1B3A3D]/10 flex items-center justify-center text-[#1B3A3D]">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg">تسجيل دخول المسؤول</h3>
              <p className="text-sm text-[#1B3A3D]/70 max-w-sm mx-auto">
                يرجى إدخال كلمة مرور المسؤول للوصول إلى تحرير العناصر، نتائج المتدربين، وإذن إعادة النشاط.
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-3">
              <div>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="كلمة مرور المسؤول"
                  className="w-full px-4 py-3 bg-white border border-[#1B3A3D]/25 rounded-xl text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-[#1B3A3D] focus:outline-hidden"
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#1B3A3D] text-[#F6F1E7] rounded-xl font-bold hover:bg-[#264e52] transition-colors shadow-md"
              >
                دخول لوحة المسؤول
              </button>
            </div>
          </form>
        ) : (
          /* Unlocked Admin Hub */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[#1B3A3D]/15 bg-[#F0EAE1] px-4 pt-2 gap-1 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('submissions')}
                className={`flex items-center gap-1.5 px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-colors whitespace-nowrap ${
                  activeTab === 'submissions'
                    ? 'bg-[#FAF7F0] text-[#1B3A3D] border-t-2 border-r border-l border-[#1B3A3D]/20 border-b-transparent'
                    : 'text-[#1B3A3D]/60 hover:text-[#1B3A3D]'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                نتائج المتدربين ({submissions.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('unlock')}
                className={`flex items-center gap-1.5 px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-colors whitespace-nowrap ${
                  activeTab === 'unlock'
                    ? 'bg-[#FAF7F0] text-[#1B3A3D] border-t-2 border-r border-l border-[#1B3A3D]/20 border-b-transparent'
                    : 'text-[#1B3A3D]/60 hover:text-[#1B3A3D]'
                }`}
              >
                <Unlock className="w-4 h-4 text-emerald-700" />
                إذن إعادة النشاط
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-4 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl transition-colors whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'bg-[#FAF7F0] text-[#1B3A3D] border-t-2 border-r border-l border-[#1B3A3D]/20 border-b-transparent'
                    : 'text-[#1B3A3D]/60 hover:text-[#1B3A3D]'
                }`}
              >
                <Key className="w-4 h-4 text-[#C9A96E]" />
                إعدادات المسؤول
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeTab === 'submissions' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="بحث بالاسم أو الرقم الوزاري أو الدرس..."
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#1B3A3D]/20 rounded-xl focus:ring-2 focus:ring-[#1B3A3D] focus:outline-hidden"
                      />
                    </div>
                    {submissions.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearSubmissions}
                        className="text-xs text-red-600 hover:text-red-700 underline px-2 py-1"
                      >
                        مسح السجل
                      </button>
                    )}
                  </div>

                  <div className="bg-[#1B3A3D]/5 border border-[#1B3A3D]/10 rounded-xl p-3 text-xs text-[#1B3A3D]/80">
                    💡 يتم إرسال كل إجابة تلقائيًا إلى بريد المسؤول: <strong>alkam14@gmail.com</strong> فور الضغط على زر الإرسال، كما تُحفظ نسخة كاملة هنا لتسهيل المتابعة.
                  </div>

                  {filteredSubmissions.length === 0 ? (
                    <div className="text-center py-10 text-[#1B3A3D]/60 text-sm">
                      لا توجد تسليمات مسجلة حتى الآن.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredSubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-white border border-[#1B3A3D]/15 rounded-xl p-4 shadow-xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <div className="font-bold text-sm text-[#1B3A3D] flex items-center gap-2">
                                <span>{sub.traineeName}</span>
                                <span className="text-xs font-normal text-[#1B3A3D]/60 px-2 py-0.5 bg-[#FAF7F0] rounded-md border border-[#1B3A3D]/10">
                                  #{sub.traineeId}
                                </span>
                              </div>
                              <div className="text-xs text-[#1B3A3D]/70 mt-0.5">
                                {sub.lessonTitle} • {sub.unitTitle}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" />
                                {sub.score} / {sub.total}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  adminService.grantRetakePermission(sub.traineeId, sub.lessonIndex);
                                  alert(`تم منح إذن إعادة المحاولة للمتدرب: ${sub.traineeName}`);
                                }}
                                className="text-xs bg-[#1B3A3D]/10 hover:bg-[#1B3A3D]/20 text-[#1B3A3D] px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1"
                                title="السماح للمتدرب بإعادة هذا النشاط"
                              >
                                <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                                إذن إعادة
                              </button>
                            </div>
                          </div>

                          <div className="text-[11px] text-[#1B3A3D]/50 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>وقت التسليم: {sub.submittedAt}</span>
                          </div>

                          {sub.answersDetail && (
                            <details className="text-xs text-[#1B3A3D]/80 bg-[#FAF7F0] p-2 rounded-lg border border-[#1B3A3D]/10">
                              <summary className="cursor-pointer font-semibold text-[#1B3A3D]">
                                عرض تفاصيل إجابات المتدرب
                              </summary>
                              <div className="mt-2 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                                {sub.answersDetail}
                              </div>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'unlock' && (
                <div className="space-y-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs sm:text-sm text-emerald-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Unlock className="w-4 h-4 text-emerald-700" />
                      إلغاء قفل الامتحان للمتدرب (السماح بإعادة المحاولة):
                    </p>
                    <p className="text-xs leading-relaxed text-emerald-800">
                      عندما يقدم المتدرب النشاط يتم قفله تلقائيًا لمنع الإعادة. يمكنك من هنا اختيار اسم المتدرب والدرس لفتح النشاط له والسماح بمحاولة جديدة.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1B3A3D] mb-1">
                        اختر المتدرب / المتدربة:
                      </label>
                      <select
                        value={selectedTraineeId}
                        onChange={(e) => setSelectedTraineeId(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#1B3A3D]/20 rounded-xl focus:ring-2 focus:ring-[#1B3A3D]"
                      >
                        {ROSTER.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1B3A3D] mb-1">
                        اختر الدرس:
                      </label>
                      <select
                        value={selectedLessonIdx}
                        onChange={(e) => setSelectedLessonIdx(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#1B3A3D]/20 rounded-xl focus:ring-2 focus:ring-[#1B3A3D]"
                      >
                        {LESSONS.map((l, idx) => (
                          <option key={idx} value={idx}>
                            {idx + 1}. {l.title} ({l.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {unlockSuccessMsg && (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 p-3 rounded-xl border border-emerald-300">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      <span>{unlockSuccessMsg}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGrantUnlock}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    منح إذن إعادة المحاولة الآن
                  </button>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Change Password */}
                  <form onSubmit={handleChangePassword} className="bg-white border border-[#1B3A3D]/15 rounded-xl p-4 sm:p-5 space-y-4">
                    <h4 className="font-bold text-sm text-[#1B3A3D] flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#C9A96E]" />
                      تغيير كلمة مرور المسؤول
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#1B3A3D]/80 mb-1">
                          كلمة المرور الجديدة:
                        </label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="كلمة مرور جديدة"
                          className="w-full px-3 py-2 text-sm bg-white border border-[#1B3A3D]/20 rounded-lg focus:ring-2 focus:ring-[#1B3A3D]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#1B3A3D]/80 mb-1">
                          تأكيد كلمة المرور:
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="أعد كتابتها للتأكيد"
                          className="w-full px-3 py-2 text-sm bg-white border border-[#1B3A3D]/20 rounded-lg focus:ring-2 focus:ring-[#1B3A3D]"
                        />
                      </div>
                    </div>

                    {pwdErrorMsg && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                        {pwdErrorMsg}
                      </div>
                    )}
                    {pwdSuccessMsg && (
                      <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        {pwdSuccessMsg}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1B3A3D] text-white rounded-lg text-xs font-bold hover:bg-[#264e52] transition-colors"
                    >
                      تحديث كلمة المرور
                    </button>
                  </form>

                  {/* Reset original lessons */}
                  <div className="bg-white border border-red-200 rounded-xl p-4 sm:p-5 space-y-3">
                    <h4 className="font-bold text-sm text-red-700 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      استعادة محتوى الدروس الأصلي
                    </h4>
                    <p className="text-xs text-[#1B3A3D]/70 leading-relaxed">
                      إذا قمت بتعديل نصوص الدروس وترغب في الرجوع إلى النسخة الأصلية المعتمدة من كتاب الثقافة المالية، يمكنك الضغط على الزر أدناه:
                    </p>
                    <button
                      type="button"
                      onClick={handleResetLessons}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg text-xs font-bold transition-colors"
                    >
                      استعادة النصوص الأصلية
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#FAF7F0] border-t border-[#1B3A3D]/15 px-5 py-3 flex items-center justify-between text-xs text-[#1B3A3D]/70 shrink-0">
              <span className="flex items-center gap-1.5 font-medium">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                وضع المسؤول نشط (يمكنك تحرير أي عنصر في الدروس الآن)
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-[#1B3A3D] text-white rounded-lg font-medium hover:bg-[#264e52] transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
