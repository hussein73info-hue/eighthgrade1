import React from 'react';
import { Trainee } from '../types';
import { ArrowLeft, User, Award, BookOpen } from 'lucide-react';

interface WelcomeScreenProps {
  user: Trainee;
  onEnter: () => void;
  onLogout: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ user, onEnter, onLogout }) => {
  return (
    <div className="w-full max-w-[820px] mx-auto min-h-screen pb-10">
      {/* Hero Header */}
      <header className="bg-[#1B3A3D] text-white rounded-b-[28px] px-6 pt-12 pb-10 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 text-white mb-3 text-4xl shadow-inner animate-bounce">
          👋
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          مرحبًا بك، {user.name}
        </h1>
        <p className="text-[#cfe0de] mt-2.5 text-base md:text-lg font-medium">
          في كتاب الثقافة المالية للصف الثامن — الفصل الدراسي الأول
        </p>
      </header>

      {/* Screen Content */}
      <main className="p-5 md:p-6 max-w-lg mx-auto">
        <div className="bg-white border-[1.5px] border-[#D9CFB4] rounded-2xl p-6 md:p-8 text-center shadow-sm space-y-6">
          {/* Identity Tag */}
          <div className="inline-flex items-center gap-2 bg-[#EFE7D2] text-[#1B3A3D] px-4 py-2 rounded-xl text-sm font-bold border border-[#D9CFB4]">
            <User className="w-4 h-4 text-[#C99A2E]" />
            <span>الرقم الوزاري: {user.id}</span>
          </div>

          {/* Prompt Paragraph */}
          <p className="text-[#5C7376] text-base leading-relaxed">
            اضغط على زر الدخول لبدء استعراض الكتاب، قراءة الدروس التعليمية، وحل الأنشطة التدريبية والاختبارات لكل درس.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={onEnter}
              id="welcomeEnterBtn"
              className="w-full flex items-center justify-center gap-2 bg-[#1B3A3D] hover:bg-[#152e30] active:scale-[0.98] transition-transform text-white font-bold py-3.5 px-6 rounded-xl text-lg shadow-sm"
            >
              <span>دخول إلى الفهرس</span>
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={onLogout}
              id="welcomeLogoutBtn"
              className="text-[#5C7376] hover:text-[#A8432E] text-sm underline py-2 transition-colors block mx-auto"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
