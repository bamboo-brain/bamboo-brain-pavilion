'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Text,
  Stack,
  Group,
  Box,
  TextInput,
  ActionIcon,
  rem,
  UnstyledButton,
  ScrollArea,
} from '@mantine/core';
import { IconSend, IconX } from '@tabler/icons-react';
import { chatWithDocuments } from '@/lib/api/search';
import FormattedChatResponse from './FormattedChatResponse';
import type { ChatMessage } from '@/types/search';

interface RagChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
  'What vocabulary did I learn from my uploads?',
  'Summarize my most recent document',
  'What HSK 4 words appear in my documents?',
  'Find content about food or restaurants',
];

export default function RagChatPanel({ isOpen, onClose }: RagChatPanelProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async (question?: string) => {
    const q = question ?? input.trim();
    if (!q || isLoading || !session?.accessToken) return;

    setInput('');

    const userMsg: ChatMessage = { role: 'user', content: q, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await chatWithDocuments({ question: q, history }, session.accessToken);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          sources: response.hasSources ? response.sources : undefined,
          timestamp: new Date(),
        },
      ]);
    } catch {
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
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.2)',
          zIndex: 40,
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <Box
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100%',
          width: '100%',
          maxWidth: rem(448),
          backgroundColor: 'var(--bb-surface-container-lowest)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Group
          justify="space-between"
          align="center"
          px={rem(20)}
          py={rem(16)}
          style={{ borderBottom: '1px solid var(--bb-surface-container)', flexShrink: 0 }}
        >
          <Group gap={rem(12)}>
            <Box
              style={{
                width: rem(36),
                height: rem(36),
                borderRadius: '50%',
                backgroundColor: 'var(--bb-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: rem(14),
                flexShrink: 0,
              }}
            >
              M
            </Box>
            <Stack gap={0}>
              <Text fw={800} fz="sm" c="var(--bb-on-surface)">
                Master Ling
              </Text>
              <Text fz={rem(11)} c="var(--bb-outline)" fw={600}>
                Answers from your documents
              </Text>
            </Stack>
          </Group>
          <ActionIcon variant="subtle" color="gray" onClick={onClose} radius={8}>
            <IconX size={18} />
          </ActionIcon>
        </Group>

        {/* Messages */}
        <ScrollArea style={{ flex: 1 }} px={rem(16)} py={rem(16)}>
          <Stack gap={rem(16)}>
            {/* Empty state */}
            {messages.length === 0 && (
              <Stack gap={rem(12)}>
                <Box
                  p={rem(16)}
                  style={{
                    backgroundColor: '#e8f5e0',
                    borderRadius: rem(16),
                  }}
                >
                  <Text fz="sm" c="#154212" fw={500} lh={1.6}>
                    👋 Hi! I can answer questions about your uploaded documents. Ask me anything
                    about the vocabulary, content, or topics you&apos;ve been studying.
                  </Text>
                </Box>

                <Text
                  fz={rem(10)}
                  fw={800}
                  c="var(--bb-outline)"
                  tt="uppercase"
                  style={{ letterSpacing: rem(1.2) }}
                  px={rem(4)}
                >
                  Suggested questions
                </Text>

                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <UnstyledButton
                    key={i}
                    onClick={() => handleSend(q)}
                    px={rem(16)}
                    py={rem(12)}
                    style={{
                      borderRadius: rem(12),
                      border: '1px solid var(--bb-surface-container)',
                      backgroundColor: 'transparent',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--bb-primary)';
                      e.currentTarget.style.backgroundColor = '#e8f5e0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--bb-surface-container)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Text fz="sm" c="var(--bb-on-surface)" fw={600}>
                      {q}
                    </Text>
                  </UnstyledButton>
                ))}
              </Stack>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <Box key={i}>
                {msg.role === 'user' ? (
                  <Group justify="flex-end">
                    <Box
                      px={rem(16)}
                      py={rem(12)}
                      style={{
                        maxWidth: '80%',
                        backgroundColor: 'var(--bb-primary)',
                        color: 'white',
                        borderRadius: `${rem(16)} ${rem(4)} ${rem(16)} ${rem(16)}`,
                      }}
                    >
                      <Text fz="sm" lh={1.5}>
                        {msg.content}
                      </Text>
                    </Box>
                  </Group>
                ) : (
                  <Group align="flex-start" gap={rem(8)} wrap="nowrap">
                    <Box
                      style={{
                        width: rem(28),
                        height: rem(28),
                        borderRadius: '50%',
                        backgroundColor: 'var(--bb-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: rem(11),
                        flexShrink: 0,
                        marginTop: rem(2),
                      }}
                    >
                      M
                    </Box>
                    <Stack gap={rem(8)} style={{ flex: 1 }}>
                      <Box
                        px={rem(16)}
                        py={rem(12)}
                        style={{
                          backgroundColor: 'var(--bb-surface-container-low)',
                          borderRadius: `${rem(4)} ${rem(16)} ${rem(16)} ${rem(16)}`,
                        }}
                      >
                        <FormattedChatResponse content={msg.content} />
                      </Box>

                      {/* Source citations */}
                      {msg.sources && msg.sources.length > 0 && (
                        <Stack gap={rem(4)}>
                          <Text fz={rem(11)} c="var(--bb-outline)" fw={600} px={rem(4)}>
                            Sources:
                          </Text>
                          {msg.sources.map((source, si) => (
                            <Group
                              key={si}
                              gap={rem(8)}
                              px={rem(12)}
                              py={rem(8)}
                              wrap="nowrap"
                              style={{
                                backgroundColor: 'var(--bb-surface-container-lowest)',
                                border: '1px solid var(--bb-surface-container)',
                                borderRadius: rem(10),
                              }}
                            >
                              <Text fz={rem(12)} c="var(--bb-primary)" style={{ flexShrink: 0 }}>
                                📄
                              </Text>
                              <Text fz={rem(11)} fw={700} c="var(--bb-on-surface)" truncate style={{ flex: 1 }}>
                                {source.documentTitle}
                              </Text>
                              <Text fz={rem(11)} c="var(--bb-outline)" fw={600} style={{ flexShrink: 0 }}>
                                {Math.round(source.score * 100)}% match
                              </Text>
                            </Group>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </Group>
                )}
              </Box>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <Group align="flex-start" gap={rem(8)} wrap="nowrap">
                <Box
                  style={{
                    width: rem(28),
                    height: rem(28),
                    borderRadius: '50%',
                    backgroundColor: 'var(--bb-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: rem(11),
                    flexShrink: 0,
                  }}
                >
                  M
                </Box>
                <Box
                  px={rem(16)}
                  py={rem(12)}
                  style={{
                    backgroundColor: 'var(--bb-surface-container-low)',
                    borderRadius: `${rem(4)} ${rem(16)} ${rem(16)} ${rem(16)}`,
                  }}
                >
                  <Group gap={rem(4)} align="center">
                    {[0, 150, 300].map((delay) => (
                      <Box
                        key={delay}
                        style={{
                          width: rem(8),
                          height: rem(8),
                          borderRadius: '50%',
                          backgroundColor: 'var(--bb-outline)',
                          animation: `bounce 1.2s ease-in-out ${delay}ms infinite`,
                        }}
                      />
                    ))}
                  </Group>
                </Box>
              </Group>
            )}

            <div ref={bottomRef} />
          </Stack>
        </ScrollArea>

        {/* Input area */}
        <Box
          px={rem(16)}
          py={rem(16)}
          style={{ borderTop: '1px solid var(--bb-surface-container)', flexShrink: 0 }}
        >
          <Group gap={rem(8)} wrap="nowrap">
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
              placeholder="Ask about your documents..."
              disabled={isLoading}
              style={{ flex: 1 }}
              styles={{
                input: {
                  borderRadius: rem(12),
                  border: '1px solid var(--bb-surface-container)',
                  backgroundColor: 'var(--bb-surface-container-low)',
                  height: rem(44),
                },
              }}
            />
            <ActionIcon
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size={44}
              radius={12}
              style={{
                backgroundColor: 'var(--bb-primary)',
                color: 'white',
                flexShrink: 0,
              }}
            >
              <IconSend size={18} />
            </ActionIcon>
          </Group>
          <Text fz={rem(11)} c="var(--bb-outline)" ta="center" mt={rem(8)} fw={600}>
            Grounded in your uploaded documents
          </Text>
        </Box>
      </Box>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
