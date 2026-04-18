'use client';
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Stack,
  Group,
  Text,
  Button,
  TextInput,
  Badge,
  ScrollArea,
  Loader,
  ActionIcon,
  UnstyledButton,
  rem,
} from '@mantine/core';
import { chatWithAdvisor } from '@/lib/api/advisor';
import type { AdvisorMessage } from '@/types/advisor';
import { IconX, IconSend } from '@tabler/icons-react';

interface StudyAdvisorPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOOL_LABELS: Record<string, string> = {
  get_user_stats: '📊 Checked your stats',
  get_active_plan: '📅 Reviewed your study plan',
  search_user_documents: '🔍 Searched your documents',
  adapt_study_plan: '🔄 Updated your study plan',
  send_notification: '🔔 Sent you a notification',
  get_vocabulary_gap: '📈 Calculated vocabulary gap',
};

const SUGGESTED_MESSAGES = [
  'How am I doing this week?',
  "I've been struggling — can you adjust my plan?",
  'What should I study today?',
  'How far am I from HSK 4?',
  "I haven't studied in a few days, help me get back on track",
];

export default function StudyAdvisorPanel({ isOpen, onClose }: StudyAdvisorPanelProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-simplebar]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (messageText?: string) => {
    const text = messageText ?? input.trim();
    if (!text || isLoading || !session?.accessToken) return;

    setInput('');

    const userMsg: AdvisorMessage = {
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await chatWithAdvisor(
        { message: text, history },
        session.accessToken,
      );

      const assistantMsg: AdvisorMessage = {
        role: 'assistant',
        content: response.answer,
        actionsPerformed: response.actionsPerformed,
        planWasAdapted: response.planWasAdapted,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          zIndex: 40,
        }}
      />

      {/* Panel */}
      <Box
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100vh',
          width: '100%',
          maxWidth: rem(448),
          backgroundColor: 'var(--bb-surface-container-low)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          style={{
            backgroundColor: 'var(--bb-primary)',
            padding: rem(16),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--bb-outline)',
          }}
        >
          <Group gap={rem(12)} style={{ flex: 1 }}>
            <Box
              style={{
                width: rem(40),
                height: rem(40),
                borderRadius: '50%',
                backgroundColor: 'var(--bb-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--bb-on-primary)',
                fontWeight: 700,
                fontSize: rem(18),
                flexShrink: 0,
              }}
            >
              M
            </Box>
            <Stack gap={0} style={{ flex: 1 }}>
              <Text
                fw={600}
                fz={rem(16)}
                c="var(--bb-on-primary)"
              >
                Master Ling
              </Text>
              <Text
                fz={rem(11)}
                c="var(--bb-on-primary-container)"
                style={{ opacity: 0.8 }}
              >
                AI Study Advisor · Powered by MAF
              </Text>
            </Stack>
          </Group>
          <ActionIcon
            onClick={onClose}
            variant="subtle"
            color="var(--bb-on-primary)"
            style={{
              color: 'var(--bb-on-primary)',
              opacity: 0.7,
            }}
          >
            <IconX size={rem(20)} />
          </ActionIcon>
        </Box>

        {/* Messages */}
        <ScrollArea
          style={{
            flex: 1,
            overflow: 'auto',
          }}
          ref={scrollAreaRef}
        >
          <Stack gap={rem(16)} p={rem(16)}>
            {/* Empty state */}
            {messages.length === 0 && (
              <Stack gap={rem(12)}>
                <Box
                  style={{
                    backgroundColor: 'var(--bb-primary-container)',
                    borderRadius: rem(16),
                    padding: rem(16),
                    border: '1px solid var(--bb-outline)',
                  }}
                >
                  <Text fz={rem(14)} c="var(--bb-on-primary-container)" lh={1.5}>
                    👋 I'm Master Ling, your personal study advisor. I can check
                    your progress, review your study plan, search your documents,
                    and even adjust your schedule — all in one conversation.
                  </Text>
                </Box>

                <Text
                  fz={rem(11)}
                  fw={700}
                  c="var(--bb-outline)"
                  style={{ textTransform: 'uppercase', letterSpacing: rem(1) }}
                  mt={rem(12)}
                  mb={rem(4)}
                >
                  Try asking me
                </Text>

                <Stack gap={rem(8)}>
                  {SUGGESTED_MESSAGES.map((msg, i) => (
                    <UnstyledButton
                      key={i}
                      onClick={() => handleSend(msg)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: rem(12),
                        borderRadius: rem(12),
                        border: '1px solid var(--bb-outline)',
                        backgroundColor: 'var(--bb-surface-container-low)',
                        color: 'var(--bb-on-surface)',
                        fontSize: rem(13),
                        transition: 'all 200ms ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--bb-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--bb-primary-container)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--bb-outline)';
                        e.currentTarget.style.backgroundColor = 'var(--bb-surface-container-low)';
                      }}
                    >
                      {msg}
                    </UnstyledButton>
                  ))}
                </Stack>
              </Stack>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <Box key={i}>
                {msg.role === 'user' ? (
                  <Group justify="flex-end">
                    <Box
                      style={{
                        maxWidth: '80%',
                        backgroundColor: 'var(--bb-primary)',
                        color: 'var(--bb-on-primary)',
                        borderRadius: rem(16),
                        padding: `${rem(12)} ${rem(16)}`,
                        fontSize: rem(13),
                        lineHeight: 1.5,
                        wordWrap: 'break-word',
                      }}
                    >
                      {msg.content}
                    </Box>
                  </Group>
                ) : (
                  <Group align="flex-start" gap={rem(8)}>
                    <Box
                      style={{
                        width: rem(32),
                        height: rem(32),
                        borderRadius: '50%',
                        backgroundColor: 'var(--bb-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--bb-on-primary)',
                        fontSize: rem(14),
                        fontWeight: 700,
                        flexShrink: 0,
                        marginTop: rem(4),
                      }}
                    >
                      M
                    </Box>
                    <Stack gap={rem(8)} style={{ flex: 1 }}>
                      {/* Tool badges */}
                      {msg.actionsPerformed && msg.actionsPerformed.length > 0 && (
                        <Group gap={rem(6)} wrap="wrap">
                          {msg.actionsPerformed
                            .filter((a) => TOOL_LABELS[a])
                            .map((action, ai) => (
                              <Badge
                                key={ai}
                                size="sm"
                                variant="light"
                                color="var(--bb-primary)"
                                style={{
                                  backgroundColor: 'var(--bb-primary-container)',
                                  color: 'var(--bb-on-primary-container)',
                                  fontSize: rem(11),
                                }}
                              >
                                {TOOL_LABELS[action]}
                              </Badge>
                            ))}
                        </Group>
                      )}

                      {/* Answer */}
                      <Box
                        style={{
                          backgroundColor: 'var(--bb-surface-container)',
                          borderRadius: rem(16),
                          padding: rem(12),
                          fontSize: rem(13),
                          color: 'var(--bb-on-surface)',
                          lineHeight: 1.6,
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                        }}
                      >
                        {msg.content}
                      </Box>

                      {/* Plan adapted banner */}
                      {msg.planWasAdapted && (
                        <Group
                          gap={rem(8)}
                          style={{
                            padding: rem(12),
                            backgroundColor: 'var(--bb-tertiary-container)',
                            borderRadius: rem(12),
                            border: '1px solid var(--bb-outline)',
                            fontSize: rem(12),
                            color: 'var(--bb-on-tertiary-container)',
                          }}
                        >
                          <Text fz={rem(14)}>🔄</Text>
                          <Text fw={600}>
                            Your study plan was updated — check the Planner
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </Group>
                )}
              </Box>
            ))}

            {/* Loading state */}
            {isLoading && (
              <Group align="flex-start" gap={rem(8)}>
                <Box
                  style={{
                    width: rem(32),
                    height: rem(32),
                    borderRadius: '50%',
                    backgroundColor: 'var(--bb-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--bb-on-primary)',
                    fontSize: rem(14),
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: rem(4),
                  }}
                >
                  M
                </Box>
                <Box
                  style={{
                    backgroundColor: 'var(--bb-surface-container)',
                    borderRadius: rem(16),
                    padding: rem(12),
                    display: 'flex',
                    gap: rem(8),
                    alignItems: 'center',
                  }}
                >
                  <Group gap={rem(4)}>
                    <Loader size="xs" color="var(--bb-primary)" />
                  </Group>
                  <Text fz={rem(12)} c="var(--bb-outline)">
                    Checking your data...
                  </Text>
                </Box>
              </Group>
            )}

            <div ref={bottomRef} />
          </Stack>
        </ScrollArea>

        {/* Input */}
        <Box
          style={{
            borderTop: '1px solid var(--bb-outline)',
            padding: rem(16),
            backgroundColor: 'var(--bb-surface-container-low)',
          }}
        >
          <Group gap={rem(8)}>
            <TextInput
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Master Ling anything..."
              disabled={isLoading}
              style={{ flex: 1 }}
              styles={{
                input: {
                  borderRadius: rem(12),
                  fontSize: rem(13),
                  backgroundColor: 'var(--bb-surface-container)',
                  borderColor: 'var(--bb-outline)',
                  color: 'var(--bb-on-surface)',
                  '&::placeholder': {
                    color: 'var(--bb-on-surface-variant)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    backgroundColor: 'var(--bb-surface-dim)',
                  },
                },
              }}
            />
            <ActionIcon
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="lg"
              style={{
                backgroundColor: 'var(--bb-primary)',
                color: 'var(--bb-on-primary)',
                borderRadius: rem(12),
                cursor: 'pointer',
              }}
              className="flex-shrink-0"
            >
              <IconSend size={rem(16)} />
            </ActionIcon>
          </Group>
          <Text
            fz={rem(11)}
            c="var(--bb-outline)"
            style={{ textAlign: 'center', marginTop: rem(8) }}
          >
            Powered by Microsoft Agent Framework + Semantic Kernel
          </Text>
        </Box>
      </Box>
    </>
  );
}
