'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Group,
  Text,
  Stack,
  ActionIcon,
  Slider,
  rem,
  Box,
} from '@mantine/core';
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconVolume2,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconMaximize,
} from '@tabler/icons-react';

interface VideoPlayerProps {
  videoUrl: string;
  fileName: string;
  duration?: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export function VideoPlayer({ videoUrl, fileName, onTimeUpdate }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    console.log('VideoPlayer: Loading video from URL:', videoUrl);
    setError(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setTotalDuration(0);

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (Math.floor(video.currentTime * 10) % 2 === 0) { // Log every 0.2 seconds to avoid spam
        console.log(`🎥 Video time: ${video.currentTime.toFixed(2)}s`);
      }
      onTimeUpdate?.(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      console.log('Video loaded successfully, duration:', video.duration);
      setTotalDuration(video.duration);
      setError(null);
    };

    const handleLoadStart = () => {
      console.log('Video loading started...', {
        networkState: video.networkState,
        readyState: video.readyState,
      });
    };

    const handleCanPlay = () => {
      console.log('Video can play', {
        networkState: video.networkState,
        readyState: video.readyState,
        duration: video.duration,
      });
    };

    const handleProgress = () => {
      console.log('Video progressing...', {
        buffered: video.buffered.length > 0 ? video.buffered.end(0) : 0,
        duration: video.duration,
      });
    };

    const handleLoadedData = () => {
      console.log('Video data loaded', {
        duration: video.duration,
        readyState: video.readyState,
      });
    };

    const handleDurationChange = () => {
      console.log('Duration changed:', video.duration);
      if (video.duration && isFinite(video.duration)) {
        setTotalDuration(video.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      const errorCode = video.error?.code;
      let errorMsg = 'Failed to load video file. ';
      if (errorCode === 1) errorMsg += 'ABORTED';
      else if (errorCode === 2) errorMsg += 'NETWORK_ERROR';
      else if (errorCode === 3) errorMsg += 'DECODE_ERROR';
      else if (errorCode === 4) errorMsg += 'NOT_SUPPORTED_FORMAT';
      else errorMsg += video.error?.message || 'Unknown error';
      
      console.error('Video error:', { code: errorCode, error: video.error, message: errorMsg });
      setError(errorMsg);
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    // Set the src and force load
    video.src = videoUrl;
    console.log('Video src set to:', videoUrl);
    console.log('Video element state before load:', {
      src: video.src,
      currentTime: video.currentTime,
      duration: video.duration,
      networkState: video.networkState,
      readyState: video.readyState,
    });
    video.load();
    console.log('Video load() called');

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onTimeUpdate, videoUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video playback started');
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error('Video playback failed:', error);
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
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(totalDuration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number): string => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => console.error('Exit fullscreen error:', err));
      } else {
        videoRef.current.requestFullscreen?.().catch((err) => console.error('Fullscreen error:', err));
      }
    }
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
      <Stack gap={rem(24)}>
        {/* Header */}
        <Stack gap={rem(8)}>
          <Text fw={800} fz={rem(18)} c="var(--bb-on-surface)">
            Video Player
          </Text>
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

        {/* Video element */}
        <Box
          style={{
            backgroundColor: '#000',
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <video
            ref={videoRef}
            preload="metadata"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
        </Box>

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
              onClick={() => handleSkip(-10)}
              disabled={!totalDuration || !!error}
              title="Skip back 10 seconds"
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
              onClick={() => handleSkip(10)}
              disabled={!totalDuration || !!error}
              title="Skip forward 10 seconds"
            >
              <IconPlayerSkipForward size={18} />
            </ActionIcon>

            <ActionIcon
              size="lg"
              radius="md"
              variant="light"
              color="gray"
              onClick={toggleFullscreen}
              disabled={!videoRef.current}
              title="Toggle fullscreen"
            >
              <IconMaximize size={18} />
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