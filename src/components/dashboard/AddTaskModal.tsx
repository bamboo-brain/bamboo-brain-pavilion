'use client';

import { Modal, TextInput, Group, Stack, Button, Select, Checkbox, Text, rem } from '@mantine/core';
import { IconCalendarStats } from '@tabler/icons-react';

interface AddTaskModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AddTaskModal({ opened, onClose }: AddTaskModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Pavilion Task"
      centered
      radius={24}
      padding={rem(32)}
      size="md"
      styles={{
        title: {
          fontWeight: 800,
          fontSize: rem(20),
          color: 'var(--bb-on-surface)',
        },
        header: {
          marginBottom: rem(12),
        },
        content: {
          backgroundColor: 'var(--bb-surface-container-lowest)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
        }
      }}
    >
      <Stack gap={rem(24)}>
        <TextInput
          label="Task Name"
          placeholder="e.g., Morning Calligraphy"
          required
          size="md"
          radius={12}
          styles={{
            input: { backgroundColor: 'var(--bb-surface-container-low)', border: 'none' },
            label: { fontWeight: 700, marginBottom: rem(8), fontSize: rem(14) }
          }}
        />

        <Group grow>
          <TextInput
            label="Start Time"
            type="time"
            defaultValue="08:00"
            size="md"
            radius={12}
            styles={{
              input: { backgroundColor: 'var(--bb-surface-container-low)', border: 'none' },
              label: { fontWeight: 700, marginBottom: rem(8), fontSize: rem(14) }
            }}
          />
          <TextInput
            label="End Time"
            type="time"
            defaultValue="09:30"
            size="md"
            radius={12}
            styles={{
              input: { backgroundColor: 'var(--bb-surface-container-low)', border: 'none' },
              label: { fontWeight: 700, marginBottom: rem(8), fontSize: rem(14) }
            }}
          />
        </Group>

        <Select
          label="Task Icon"
          placeholder="Pick an emoji"
          data={['✍️ Calligraphy', '📖 Reading', '📝 HSK Prep', '🎧 Listening', '🗣️ Speaking']}
          defaultValue="✍️ Calligraphy"
          size="md"
          radius={12}
          styles={{
            input: { backgroundColor: 'var(--bb-surface-container-low)', border: 'none' },
            label: { fontWeight: 700, marginBottom: rem(8), fontSize: rem(14) }
          }}
        />

        <Checkbox
          label={
            <Text fz="sm" fw={600} c="var(--bb-on-surface-variant)">
              Sync with Google Calendar (G-SYNC)
            </Text>
          }
          defaultChecked
          color="var(--bb-primary)"
          styles={{
            body: { alignItems: 'center' },
          }}
        />

        <Stack gap={rem(12)} mt={rem(8)}>
          <Button
            className="bb-btn-primary"
            size="lg"
            radius={16}
            h={rem(60)}
            leftSection={<IconCalendarStats size={20} />}
            onClick={onClose}
            fw={800}
            fz={rem(16)}
          >
            Create Task & Sync
          </Button>
          <Button
            variant="subtle"
            color="gray"
            size="md"
            onClick={onClose}
            fw={700}
            fz={rem(14)}
          >
            Discard
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
