/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lesson, SubmissionRecord } from '../types';
import { LESSONS as DEFAULT_LESSONS } from '../data/lessons';

const STORAGE_KEY_ADMIN_PWD = 'fin_lit_admin_password_v1';
const STORAGE_KEY_CUSTOM_LESSONS = 'fin_lit_custom_lessons_v1';
const STORAGE_KEY_SUBMISSIONS = 'fin_lit_submissions_v1';
const STORAGE_KEY_UNLOCKED_ATTEMPTS = 'fin_lit_unlocked_attempts_v1';

const DEFAULT_ADMIN_PASSWORD = 'hussein_2026';

export const adminService = {
  // Password Management
  getAdminPassword(): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADMIN_PWD);
      if (saved && saved !== '1234') {
        return saved;
      }
      return DEFAULT_ADMIN_PASSWORD;
    } catch {
      return DEFAULT_ADMIN_PASSWORD;
    }
  },

  verifyPassword(pwd: string): boolean {
    const current = this.getAdminPassword();
    return pwd.trim() === current.trim();
  },

  setAdminPassword(newPwd: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_PWD, newPwd.trim());
    } catch (e) {
      console.error(e);
    }
  },

  // Lessons content customization
  getLessons(): Lesson[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_LESSONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load custom lessons:', e);
    }
    return DEFAULT_LESSONS;
  },

  saveLesson(lessonIndex: number, updatedLesson: Lesson): void {
    const current = this.getLessons();
    const updated = [...current];
    updated[lessonIndex] = updatedLesson;
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_LESSONS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  },

  saveAllLessons(lessons: Lesson[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_LESSONS, JSON.stringify(lessons));
    } catch (e) {
      console.error(e);
    }
  },

  resetLessonsToDefault(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_LESSONS);
    } catch (e) {
      console.error(e);
    }
  },

  // Submissions Log
  getSubmissions(): SubmissionRecord[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  recordSubmission(record: SubmissionRecord): void {
    try {
      const all = this.getSubmissions();
      // Add newest first
      const updated = [record, ...all.filter(s => s.id !== record.id)];
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  },

  clearSubmissions(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_SUBMISSIONS);
    } catch (e) {
      console.error(e);
    }
  },

  // Unlocking retake permission
  // Key format: `${traineeId}_${lessonIndex}` -> allowed count or true
  getUnlockedAttempts(): Record<string, boolean> {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UNLOCKED_ATTEMPTS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  },

  grantRetakePermission(traineeId: string, lessonIndex: number): void {
    try {
      const key = `${traineeId}_${lessonIndex}`;
      const map = this.getUnlockedAttempts();
      map[key] = true;
      localStorage.setItem(STORAGE_KEY_UNLOCKED_ATTEMPTS, JSON.stringify(map));
    } catch (e) {
      console.error(e);
    }
  },

  consumeRetakePermission(traineeId: string, lessonIndex: number): void {
    try {
      const key = `${traineeId}_${lessonIndex}`;
      const map = this.getUnlockedAttempts();
      delete map[key];
      localStorage.setItem(STORAGE_KEY_UNLOCKED_ATTEMPTS, JSON.stringify(map));
    } catch (e) {
      console.error(e);
    }
  },

  isRetakePermitted(traineeId: string, lessonIndex: number): boolean {
    const key = `${traineeId}_${lessonIndex}`;
    const map = this.getUnlockedAttempts();
    return !!map[key];
  }
};
