import { Injectable } from '@angular/core';

export interface StoredAnswers {
  attemptId: string;
  quizId: string;
  answers: Record<string, string>;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AttemptStorageService {
  private key(attemptId: string): string {
    return `skillmark_attempt_${attemptId}`;
  }

  save(attemptId: string, quizId: string, answers: Record<string, string>): void {
    const payload: StoredAnswers = {
      attemptId,
      quizId,
      answers,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(this.key(attemptId), JSON.stringify(payload));
  }

  load(attemptId: string): Record<string, string> | null {
    const raw = localStorage.getItem(this.key(attemptId));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as StoredAnswers;
      if (parsed.attemptId !== attemptId) return null;
      return parsed.answers;
    } catch {
      return null;
    }
  }

  clear(attemptId: string): void {
    localStorage.removeItem(this.key(attemptId));
  }
}
