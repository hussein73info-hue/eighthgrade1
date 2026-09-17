/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trainee, Lesson, SubmissionRecord } from '../types';
import { adminService } from './adminService';

const TARGET_EMAIL = 'alkam14@gmail.com';

export interface SendResultParams {
  trainee: Trainee;
  lesson: Lesson;
  lessonIndex: number;
  score: number;
  total: number;
  answersSummary: string;
}

export const emailService = {
  async sendResult(params: SendResultParams): Promise<{ success: boolean; error?: string }> {
    const { trainee, lesson, lessonIndex, score, total, answersSummary } = params;
    const dateStr = new Date().toLocaleString('ar-JO', {
      timeZone: 'Asia/Amman',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const percentage = Math.round((score / total) * 100);

    // 1. Record in local supervisor log immediately
    const record: SubmissionRecord = {
      id: `${trainee.id}_${lessonIndex}_${Date.now()}`,
      traineeId: trainee.id,
      traineeName: trainee.name,
      lessonIndex,
      lessonTitle: lesson.title,
      unitTitle: lesson.unit,
      score,
      total,
      submittedAt: dateStr,
      answersDetail: answersSummary
    };
    adminService.recordSubmission(record);

    // 2. Dispatch to FormSubmit AJAX endpoint for email delivery
    try {
      const emailBody = {
        _subject: `نتيجة نشاط الثقافة المالية: ${trainee.name} - ${lesson.title}`,
        _replyto: TARGET_EMAIL,
        _template: 'table',
        _captcha: 'false',
        'اسم المتدرب': trainee.name,
        'الرقم الوزاري': trainee.id,
        'الوحدة': lesson.unit,
        'الدرس': lesson.title,
        'الدرجة': `${score} من ${total} (${percentage}%)`,
        'وقت التسليم': dateStr,
        'تفاصيل الإجابات': answersSummary
      };

      const response = await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailBody)
      });

      if (!response.ok) {
        console.warn('Email dispatch HTTP status:', response.status);
      }

      return { success: true };
    } catch (err) {
      console.error('Email sending network error:', err);
      // Even if network fails or FormSubmit is blocked, the record is safely saved in local supervisor logs
      return { success: true };
    }
  }
};
