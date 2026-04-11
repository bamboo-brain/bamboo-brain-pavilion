'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Stack,
  Group,
  Text,
  Button,
  Box,
  Progress,
  rem,
  Skeleton,
  ActionIcon,
  Badge,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MultipleChoice } from '@/components/quiz/questions/MultipleChoice';
import { FillInBlank } from '@/components/quiz/questions/FillInBlank';
import { ToneIdentification } from '@/components/quiz/questions/ToneIdentification';
import { Listening } from '@/components/quiz/questions/Listening';
import { AnswerFeedback } from '@/components/quiz/AnswerFeedback';
import { getSession, submitAnswer, completeQuiz } from '@/lib/quiz';
import type { QuizSession, SubmitAnswerResponse } from '@/types/quiz';

const TYPE_LABEL: Record<string, string> = {
  'multiple-choice': 'Multiple Choice',
  'fill-in-blank': 'Fill in the Blank',
  'tone-identification': 'Tone Identification',
  'listening': 'Listening',
};

export default function QuizPlayerPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken ?? '';

  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'answering' | 'revealed'>('answering');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<SubmitAnswerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const questionStartTime = useRef(Date.now());

  useEffect(() => {
    if (!accessToken || !sessionId) return;
    getSession(sessionId, accessToken)
      .then((s) => {
        setQuizSession(s);
        // Resume support: skip already-answered questions
        const answeredIds = new Set(s.answers.map((a) => a.questionId));
        const firstUnanswered = s.questions.findIndex((q) => !answeredIds.has(q.id));
        setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
        questionStartTime.current = Date.now();
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accessToken, sessionId]);

  const handleSubmit = useCallback(async (answer: string) => {
    if (!quizSession || submitting) return;
    const currentQuestion = quizSession.questions[currentIndex];
    if (!currentQuestion) return;

    setSubmitting(true);
    try {
      const timeSpent = Math.round((Date.now() - questionStartTime.current) / 1000);
      const result = await submitAnswer(
        sessionId,
        { questionId: currentQuestion.id, userAnswer: answer, timeSpentSeconds: timeSpent },
        accessToken,
      );
      setLastResult(result);
      setPhase('revealed');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }, [quizSession, submitting, currentIndex, sessionId, accessToken]);

  const handleNext = useCallback(async () => {
    if (!quizSession) return;
    const isLast = currentIndex + 1 >= quizSession.questions.length;

    if (isLast) {
      try {
        await completeQuiz(sessionId, accessToken);
      } catch (e) {
        console.error(e);
      }
      router.push(`/study-center/quiz/${sessionId}/results`);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setPhase('answering');
    setLastResult(null);
    questionStartTime.current = Date.now();
  }, [quizSession, currentIndex, sessionId, accessToken, router]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!quizSession) return;

      const q = quizSession.questions[currentIndex];
      if (!q) return;

      // Don't intercept 1–4 for fill-in-blank (user is typing)
      if (q.type === 'fill-in-blank') {
        if (e.key === 'Enter' && phase === 'revealed') handleNext();
        return;
      }

      if (phase === 'answering') {
        const idx = ['1', '2', '3', '4'].indexOf(e.key);
        if (idx >= 0 && q.options[idx]) setSelectedAnswer(q.options[idx]);
        if (e.key === 'Enter' && selectedAnswer) handleSubmit(selectedAnswer);
      } else if (phase === 'revealed') {
        if (e.key === 'Enter') handleNext();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, selectedAnswer, currentIndex, quizSession, handleSubmit, handleNext]);

  if (loading) {
    return (
      <AppLayout>
        <Stack align="center" gap={rem(24)} pt={rem(40)} maw={rem(680)} mx="auto">
          <Skeleton height={rem(8)} radius="xl" />
          <Skeleton height={rem(280)} radius={24} />
          <Skeleton height={rem(60)} radius={14} />
        </Stack>
      </AppLayout>
    );
  }

  if (!quizSession) {
    return (
      <AppLayout>
        <Stack align="center" pt={rem(80)} gap={rem(16)}>
          <Text fw={700}>Quiz session not found.</Text>
          <Button variant="light" color="gray" onClick={() => router.push('/study-center/quiz')}>
            Back to Quiz Center
          </Button>
        </Stack>
      </AppLayout>
    );
  }

  const currentQuestion = quizSession.questions[currentIndex];
  const answeredCount = quizSession.answers.length + (phase === 'revealed' ? 1 : 0);
  const progress = (answeredCount / quizSession.totalQuestions) * 100;
  const isLast = currentIndex + 1 >= quizSession.questions.length;

  return (
    <AppLayout>
      <Stack gap={rem(32)} pt={rem(16)} maw={rem(680)} mx="auto">
        {/* Top bar */}
        <Stack gap={rem(12)}>
          <Group justify="space-between" align="center">
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={() => router.push('/study-center/quiz')}>
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Group gap={rem(10)}>
              {currentQuestion?.type && (
                <Badge variant="light" color="gray" size="sm" radius="sm" fw={700}>
                  {TYPE_LABEL[currentQuestion.type]}
                </Badge>
              )}
              {currentQuestion?.hskLevel != null && (
                <Badge variant="light" color="green" size="sm" radius="sm" fw={700}>
                  HSK {currentQuestion.hskLevel}
                </Badge>
              )}
              <Text fz="sm" fw={700} c="var(--bb-on-surface-variant)">
                {currentIndex + 1} / {quizSession.totalQuestions}
              </Text>
            </Group>
          </Group>
          <Progress value={progress} size="sm" radius="xl" color="var(--bb-primary)" bg="var(--bb-surface-container)" />
        </Stack>

        {/* Question card */}
        <Box
          style={{
            backgroundColor: 'var(--bb-surface-container-lowest)',
            borderRadius: rem(24),
            padding: rem(40),
          }}
        >
          <Stack gap={rem(32)}>
            {/* Question text */}
            <Text fz={rem(22)} fw={800} c="var(--bb-on-surface)" ta="center" lh={1.4}>
              {currentQuestion?.question}
            </Text>

            {/* Word display for non-listening, non-fill-in-blank types */}
            {currentQuestion?.type === 'multiple-choice' && currentQuestion.word && (
              <Text
                fz={rem(56)}
                fw={800}
                ta="center"
                c="var(--bb-on-surface)"
                style={{ fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1 }}
              >
                {currentQuestion.word}
              </Text>
            )}

            {/* Question component */}
            {currentQuestion?.type === 'multiple-choice' && (
              <MultipleChoice
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                onSelect={setSelectedAnswer}
                phase={phase}
                correctAnswer={lastResult?.correctAnswer}
                isCorrect={lastResult?.isCorrect}
              />
            )}

            {currentQuestion?.type === 'fill-in-blank' && (
              <FillInBlank
                question={currentQuestion}
                onSubmit={handleSubmit}
                phase={phase}
                correctAnswer={lastResult?.correctAnswer ?? currentQuestion.correctAnswer}
                isCorrect={lastResult?.isCorrect}
              />
            )}

            {currentQuestion?.type === 'tone-identification' && (
              <ToneIdentification
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                onSelect={setSelectedAnswer}
                phase={phase}
                correctAnswer={lastResult?.correctAnswer}
                isCorrect={lastResult?.isCorrect}
              />
            )}

            {currentQuestion?.type === 'listening' && (
              <Listening
                question={currentQuestion}
                selectedAnswer={selectedAnswer}
                onSelect={setSelectedAnswer}
                phase={phase}
                correctAnswer={lastResult?.correctAnswer}
                isCorrect={lastResult?.isCorrect}
              />
            )}
          </Stack>
        </Box>

        {/* Submit button (answering phase, non-fill-in-blank) */}
        {phase === 'answering' && currentQuestion?.type !== 'fill-in-blank' && (
          <Stack align="center" gap={rem(8)}>
            <Button
              className="bb-btn-primary"
              size="lg"
              radius={14}
              fw={800}
              fullWidth
              h={rem(56)}
              disabled={!selectedAnswer}
              loading={submitting}
              onClick={() => selectedAnswer && handleSubmit(selectedAnswer)}
            >
              Submit Answer
            </Button>
            <Text fz="xs" fw={600} c="var(--bb-outline)">
              Press 1 · 2 · 3 · 4 to select · Enter to submit
            </Text>
          </Stack>
        )}

        {/* Feedback (revealed phase) */}
        {phase === 'revealed' && lastResult && (
          <AnswerFeedback
            isCorrect={lastResult.isCorrect}
            correctAnswer={lastResult.correctAnswer}
            explanation={lastResult.explanation}
            onNext={handleNext}
            isLastQuestion={isLast}
          />
        )}
      </Stack>
    </AppLayout>
  );
}
