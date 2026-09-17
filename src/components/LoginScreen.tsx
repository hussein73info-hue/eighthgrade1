import React, { useState } from 'react';
import { ROSTER } from '../data/roster';
import { Trainee } from '../types';
import { BookOpen, UserCheck, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: Trainee) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedName, setSelectedName] = useState('');
  const [enteredId, setEnteredId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sorted alphabetically by Arabic name
  const sortedRoster = [...ROSTER].sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedId = enteredId.trim();

    if (!selectedName || !trimmedId) {
      setErrorMessage('يرجى اختيار الاسم وإدخال الرقم الوزاري.');
      return;
    }

    const match = ROSTER.find(
      (r) => r.name === selectedName && r.id === trimmedId
    );

    if (!match) {
      setErrorMessage('لا يوجد تطابق بين الاسم والرقم الوزاري المدخل. يرجى التأكد من البيانات.');
      return;
    }

    setErrorMessage('');
    onLogin(match);
  };

  return (
    <div className="w-full max-w-[820px] mx-auto min-h-screen pb-10">
      {/* Hero Header */}
      <header className="bg-[#1B3A3D] text-white rounded-b-[28px] px-6 pt-10 pb-8 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 text-white mb-3 text-3xl shadow-inner">
          <BookOpen className="w-8 h-8 text-[#C99A2E]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          كتاب الثقافة المالية
        </h1>
        <p className="text-[#cfe0de] mt-2 text-base md:text-lg font-medium">
          الصف الثامن — الفصل الدراسي الأول
        </p>
      </header>

      {/* Main Login Screen */}
      <main className="p-5 md:p-6 max-w-lg mx-auto">
        <div className="bg-white border-[1.5px] border-[#D9CFB4] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <UserCheck className="w-5 h-5 text-[#1B3A3D]" />
            <h2 className="text-xl font-bold text-[#1B3A3D]">تسجيل دخول المتدرب/ة</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Select */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="loginNameSelect" className="font-bold text-sm text-[#1B3A3D]">
                الاسم
              </label>
              <select
                id="loginNameSelect"
                value={selectedName}
                onChange={(e) => {
                  setSelectedName(e.target.value);
                  setErrorMessage('');
                }}
                className="rounded-xl border-[1.5px] border-[#D9CFB4] p-3 text-base bg-white text-[#1B3A3D] w-full focus-visible:outline-[#C99A2E] focus-visible:outline-[3px]"
              >
                <option value="">-- اختر اسمك من القائمة --</option>
                {sortedRoster.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ministry ID */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="loginIdInput" className="font-bold text-sm text-[#1B3A3D]">
                الرقم الوزاري
              </label>
              <input
                type="text"
                id="loginIdInput"
                placeholder="أدخل رقمك الوزاري"
                inputMode="numeric"
                value={enteredId}
                onChange={(e) => {
                  setEnteredId(e.target.value);
                  setErrorMessage('');
                }}
                className="rounded-xl border-[1.5px] border-[#D9CFB4] p-3 text-base bg-white text-[#1B3A3D] w-full focus-visible:outline-[#C99A2E] focus-visible:outline-[3px]"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                id="loginErrorBox"
                className="flex items-start gap-2.5 bg-[#fdeceb] border-[1.5px] border-[#A8432E] text-[#A8432E] rounded-xl p-3 text-sm font-medium animate-fadeIn"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              id="doLoginBtn"
              className="w-full bg-[#1B3A3D] hover:bg-[#152e30] active:scale-[0.98] transition-transform text-white font-bold py-3.5 px-5 rounded-xl text-base shadow-sm mt-2"
            >
              دخول
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
