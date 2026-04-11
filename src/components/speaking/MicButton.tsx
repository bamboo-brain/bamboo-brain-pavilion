'use client';

import { Box, Text, Loader, rem } from '@mantine/core';
import { MicIcon } from '@/components/icons';

interface MicButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
}

export function MicButton({
  isRecording,
  isProcessing,
  onMouseDown,
  onMouseUp,
  onTouchStart,
  onTouchEnd,
}: MicButtonProps) {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: rem(8) }}>
      <button
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchStart={(e) => { e.preventDefault(); onTouchStart(); }}
        onTouchEnd={(e) => { e.preventDefault(); onTouchEnd(); }}
        disabled={isProcessing}
        style={{
          width: rem(72),
          height: rem(72),
          borderRadius: '50%',
          border: 'none',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          backgroundColor: isRecording
            ? '#e03131'
            : isProcessing
            ? 'var(--bb-surface-container)'
            : 'var(--bb-primary)',
          boxShadow: isRecording
            ? '0 0 0 8px rgba(224, 49, 49, 0.2)'
            : isProcessing
            ? 'none'
            : '0 8px 24px rgba(21, 66, 18, 0.3)',
          transform: isRecording ? 'scale(1.1)' : 'scale(1)',
          animation: isRecording ? 'micPulse 1.2s ease-in-out infinite' : 'none',
        }}
      >
        {isProcessing ? (
          <Loader size="sm" color="var(--bb-on-surface-variant)" />
        ) : (
          <MicIcon size={30} color="white" />
        )}
      </button>

      <Text fz="xs" fw={700} c="var(--bb-outline)" ta="center">
        {isRecording
          ? 'Release to send'
          : isProcessing
          ? 'Processing...'
          : 'Hold to speak'}
      </Text>

      <style>{`
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(224, 49, 49, 0.2); }
          50% { box-shadow: 0 0 0 14px rgba(224, 49, 49, 0.1); }
        }
      `}</style>
    </Box>
  );
}
