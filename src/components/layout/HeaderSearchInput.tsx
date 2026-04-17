'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TextInput, rem } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

export function HeaderSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [headerSearchQuery, setHeaderSearchQuery] = useState(searchParams.get('q') ?? '');

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      router.push(`/library?q=${encodeURIComponent(headerSearchQuery)}`);
    }
  };

  return (
    <TextInput
      placeholder="Search your library..."
      rightSection={<IconSearch size={20} color="var(--bb-outline)" />}
      value={headerSearchQuery}
      onChange={(e) => setHeaderSearchQuery(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleHeaderSearch(e as any);
      }}
      styles={{
        input: {
          width: rem(340),
          height: rem(48),
          borderRadius: rem(12),
          border: 'none',
          backgroundColor: 'var(--bb-surface-container-lowest)',
          paddingLeft: rem(20),
          fontSize: rem(14),
        },
      }}
    />
  );
}
