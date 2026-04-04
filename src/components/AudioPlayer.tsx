'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Group,
  Text,
  Stack,
  ActionIcon,
  Slider,
  Title,
  rem,
  Box,
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconVolume2,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
} from '@tabler/icons-react';

interface AudioPlayerProps {
  audioUrl: string;
  fileName: string;
  duration?: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export function AudioPlayer({ audioUrl, fileName, onTimeUpdate }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    console.log('AudioPlayer: Loading audio from URL:', audioUrl);
    setError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setTotalDuration(0);

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      console.log('Audio loaded successfully, duration:', audio.duration);
      setTotalDuration(audio.duration);
      setError(null);
    };

    const handleLoadStart = () => {
      console.log('Audio loading started...', {
        networkState: audio.networkState,
        readyState: audio.readyState,
      });
    };

    const handleCanPlay = () => {
      console.log('Audio can play', {
        networkState: audio.networkState,
        readyState: audio.readyState,
        duration: audio.duration,
      });
    };

    const handleProgress = () => {
      console.log('Audio progressing...', {
        buffered: audio.buffered.length > 0 ? audio.buffered.end(0) : 0,
        duration: audio.duration,
      });
    };

    const handleLoadedData = () => {
      console.log('Audio data loaded', {
        duration: audio.duration,
        readyState: audio.readyState,
      });
    };

    const handleDurationChange = () => {
      console.log('Duration changed:', audio.duration);
      if (audio.duration && isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      const errorCode = audio.error?.code;
      let errorMsg = 'Failed to load audio file. ';
      if (errorCode === 1) errorMsg += 'ABORTED';
      else if (errorCode === 2) errorMsg += 'NETWORK_ERROR';
      else if (errorCode === 3) errorMsg += 'DECODE_ERROR';
      else if (errorCode === 4) errorMsg += 'NOT_SUPPORTED_FORMAT';
      else errorMsg += audio.error?.message || 'Unknown error';
      
      console.error('Audio error:', { code: errorCode, error: audio.error, message: errorMsg });
      setError(errorMsg);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Set the src and force load
    audio.src = audioUrl;
    console.log('Audio src set to:', audioUrl);
    console.log('Audio element state before load:', {
      src: audio.src,
      currentTime: audio.currentTime,
      duration: audio.duration,
      networkState: audio.networkState,
      readyState: audio.readyState,
    });
    audio.load();
    console.log('Audio load() called');

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onTimeUpdate, audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playback started');
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error('Audio playback failed:', error);
              setError(`Playback failed: ${error.message}`);
            });
        } else {
          // Older browsers don't return a Promise
          setIsPlaying(true);
        }
      }
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(totalDuration, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card
      radius={24}
      p={rem(32)}
      style={{
        backgroundColor: 'var(--bb-surface-container-lowest)',
        border: 'none',
      }}
    >
      <audio 
        ref={audioRef} 
        preload="metadata"
        style={{ display: 'none' }}
      />

      <Stack gap={rem(24)}>
        {/* Header */}
        <Stack gap={rem(8)}>
          <Title order={3} fz={rem(18)} fw={800} c="var(--bb-on-surface)">
            Audio Player
          </Title>
          <Text fz={rem(13)} c="var(--bb-on-surface-variant)" fw={500}>
            {fileName}
          </Text>
        </Stack>

        {/* Error message */}
        {error && (
          <Box
            p={rem(12)}
            style={{
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              borderRadius: 8,
              border: '1px solid rgba(255, 0, 0, 0.3)',
            }}
          >
            <Text fz={rem(12)} c="red" fw={600}>
              {error}
            </Text>
          </Box>
        )}

        {/* Timeline progress bar */}
        <Stack gap={rem(8)}>
          <Slider
            value={currentTime}
            onChange={handleSeek}
            max={totalDuration || 0}
            step={0.1}
            disabled={!totalDuration || !!error}
            style={{
              cursor: totalDuration && !error ? 'pointer' : 'default',
            }}
          />
          <Group justify="space-between">
            <Text fz={rem(12)} fw={600} c="var(--bb-on-surface-variant)">
              {formatTime(currentTime)}
            </Text>
            <Text fz={rem(12)} fw={600} c="var(--bb-on-surface-variant)">
              {formatTime(totalDuration)}
            </Text>
          </Group>
        </Stack>

        {/* Controls */}
        <Stack gap={rem(16)}>
          {/* Play controls */}
          <Group justify="center" gap={rem(16)}>
            <ActionIcon
              size="lg"
              radius="md"
              variant="light"
              color="gray"
              onClick={() => handleSkip(-5)}
              disabled={!totalDuration || !!error}
              title="Skip back 5 seconds"
            >
              <IconPlayerSkipBack size={18} />
            </ActionIcon>

            <ActionIcon
              size="xl"
              radius="md"
              variant="filled"
              color="var(--bb-primary)"
              onClick={togglePlayPause}
              disabled={!totalDuration || !!error}
            >
              {isPlaying ? (
                <IconPlayerPause size={20} />
              ) : (
                <IconPlayerPlay size={20} />
              )}
            </ActionIcon>

            <ActionIcon
              size="lg"
              radius="md"
              variant="light"
              color="gray"
              onClick={() => handleSkip(5)}
              disabled={!totalDuration || !!error}
              title="Skip forward 5 seconds"
            >
              <IconPlayerSkipForward size={18} />
            </ActionIcon>
          </Group>

          {/* Volume control */}
          <Group gap={rem(12)} align="center">
            <Box style={{ display: 'flex', alignItems: 'center', color: 'var(--bb-on-surface-variant)' }}>
              <IconVolume2 size={18} />
            </Box>
            <Slider
              value={volume}
              onChange={setVolume}
              min={0}
              max={1}
              step={0.01}
              style={{ flex: 1 }}
              disabled={!!error}
            />
            <Text fz={rem(11)} fw={600} c="var(--bb-on-surface-variant)" style={{ minWidth: rem(28) }}>
              {Math.round(volume * 100)}%
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
}
