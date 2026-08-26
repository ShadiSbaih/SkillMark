import { TestBed } from '@angular/core/testing';
import { AttemptStorageService } from './attempt-storage.service';

describe('AttemptStorageService', () => {
  let service: AttemptStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttemptStorageService);
    localStorage.clear();
  });

  it('saves and loads answers', () => {
    service.save('attempt-1', 'quiz-1', { q1: 'o1' });
    expect(service.load('attempt-1')).toEqual({ q1: 'o1' });
  });

  it('returns null for missing attempt', () => {
    expect(service.load('missing')).toBeNull();
  });

  it('clears saved answers', () => {
    service.save('attempt-1', 'quiz-1', { q1: 'o1' });
    service.clear('attempt-1');
    expect(service.load('attempt-1')).toBeNull();
  });

  it('returns null when stored attemptId does not match', () => {
    localStorage.setItem(
      'skillmark_attempt_attempt-1',
      JSON.stringify({ attemptId: 'other', quizId: 'quiz-1', answers: { q1: 'o1' }, updatedAt: new Date().toISOString() })
    );
    expect(service.load('attempt-1')).toBeNull();
  });

  it('returns null for corrupted storage data', () => {
    localStorage.setItem('skillmark_attempt_attempt-1', 'not-json');
    expect(service.load('attempt-1')).toBeNull();
  });
});
