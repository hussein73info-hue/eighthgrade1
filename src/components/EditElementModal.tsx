/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Save, X, AlertCircle } from 'lucide-react';
import { adminService } from '../services/adminService';

interface EditElementModalProps {
  isOpen: boolean;
  title: string;
  currentValue: string;
  multiline?: boolean;
  onSave: (newValue: string) => void;
  onClose: () => void;
  isAdminUnlocked: boolean;
  onAdminUnlocked: () => void;
}

export const EditElementModal: React.FC<EditElementModalProps> = ({
  isOpen,
  title,
  currentValue,
  multiline = false,
  onSave,
  onClose,
  isAdminUnlocked,
  onAdminUnlocked,
}) => {
  const [value, setValue] = useState(currentValue);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminUnlocked) {
      if (!adminService.verifyPassword(password)) {
        setError('كلمة مرور المسؤول غير صحيحة');
        return;
      }
      onAdminUnlocked();
    }

    if (!value.trim()) {
      setError('لا يمكن ترك المحتوى فارغًا');
      return;
    }

    onSave(value);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[#FAF7F0] border-2 border-[#1B3A3D]/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#1B3A3D] text-[#F6F1E7] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#C9A96E]" />
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#F6F1E7]/70 hover:text-white transition-colors p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {!isAdminUnlocked && (
            <div className="bg-[#C9A96E]/15 border border-[#C9A96E]/40 p-3.5 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-[#1B3A3D] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C9A96E]" />
                أدخل كلمة مرور المسؤول لتأكيد التحرير:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="كلمة مرور المسؤول"
                className="w-full px-3 py-2 text-sm bg-white border border-[#1B3A3D]/20 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#1B3A3D] text-[#1B3A3D]"
                autoFocus
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#1B3A3D] mb-1.5">
              تعديل المحتوى:
            </label>
            {multiline ? (
              <textarea
                rows={5}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError('');
                }}
                className="w-full p-3 bg-white border border-[#1B3A3D]/20 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1B3A3D] text-[#1B3A3D] text-sm leading-relaxed"
              />
            ) : (
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2.5 bg-white border border-[#1B3A3D]/20 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1B3A3D] text-[#1B3A3D] text-sm"
              />
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#1B3A3D]/70 hover:text-[#1B3A3D] transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#1B3A3D] text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-[#264e52] transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              حفظ التعديل
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
