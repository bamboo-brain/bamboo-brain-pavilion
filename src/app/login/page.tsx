'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Anchor,
  Paper,
  Tabs,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { GoogleIcon, LeafIcon, BookIcon, PathIcon, FileTextIcon, MicIcon, CalendarIcon, MicrosoftIcon } from '@/components/icons';
import { FeaturePill } from '@/components/FeaturePill';
import styles from './login.module.css';

/* ── Main page ── */
export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<string | null>('login');

  const loginForm = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Please enter a valid email'),
      password: (v) => (v.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const signupForm = useForm({
    initialValues: { name: '', email: '', password: '' },
    validate: {
      name: (v) => (v.trim().length > 0 ? null : 'Name is required'),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Please enter a valid email'),
      password: (v) => (v.length >= 8 ? null : 'Password must be at least 8 characters'),
    },
  });

  return (
    <main className={styles.root}>
      {/* ── Left panel – branding ─────────────────────────── */}
      <div className={styles.leftPanel} aria-hidden="false">
        {/* Decorative bamboo rings */}
        <div className={styles.ringOuter} aria-hidden="true" />
        <div className={styles.ringInner} aria-hidden="true" />

        {/* Logo */}
        <div className={styles.logoArea}>
          <div className={styles.logoMark}>
            <LeafIcon />
          </div>
          <div className={styles.logoWords}>
            <Text className={styles.logoText}>BambooBrain</Text>
            <Text className={styles.logoTextZh}>竹子大脑</Text>
          </div>
        </div>

        {/* Hero copy */}
        <div className={styles.heroContent}>
          {/* Large decorative watermark */}
          <div className={styles.heroWatermark} aria-hidden="true">竹子大脑</div>
          <Text className={styles.heroLabel}>学无止境</Text>
          <Title order={1} className={styles.heroTitle}>
            Welcome to<br />
            the <span className={styles.heroTitleAccent}>Pavilion</span>
          </Title>
          <Text className={styles.heroSub}>
            Enter a space designed for deep focus. Mastery of Mandarin is not a
            sprint, but a path through a quiet grove.
          </Text>

          {/* Feature pills */}
          <Stack gap="sm" mt="xl">
            <FeaturePill
              icon={<FileTextIcon />}
              label="Extract Chinese vocabulary from your PDFs, Videos, & Audio"
            />
            <FeaturePill
              icon={<BookIcon />}
              label="Hover over words for instant meanings, Pinyin, & Quizzes"
            />
            <FeaturePill
              icon={<MicIcon />}
              label="Interactive AI Speaking Practice with transcript history"
            />
            <FeaturePill
              icon={<CalendarIcon />}
              label="Automatic study planning with Google Calendar sync"
            />
          </Stack>
        </div>

        {/* Footer */}
        <div className={styles.leftFooter}>
          <Text size="xs" c="rgba(255,255,255,0.45)">
            © 2026 BambooBrain · The Scholar&apos;s Pavilion
          </Text>
        </div>
      </div>

      {/* ── Right panel – form ────────────────────────────── */}
      <div className={styles.rightPanel}>
        <Paper className={styles.formCard} radius="lg" shadow="xs">
          {/* Tab switcher */}
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            classNames={{
              root: styles.tabs,
              tab: styles.tab,
              panel: styles.tabPanel,
            }}
          >
            <Tabs.List grow className={styles.tabList}>
              <Tabs.Tab value="login" id="tab-login">
                Sign In
              </Tabs.Tab>
              <Tabs.Tab value="signup" id="tab-signup">
                Create Account
              </Tabs.Tab>
            </Tabs.List>

            {/* ── Sign In ── */}
            <Tabs.Panel value="login">
              <Stack gap={0} mt="xl">
                <Title order={2} className={styles.formTitle}>
                  Continue your studies
                </Title>
                <Text size="sm" className={styles.formSub}>
                  Select your preferred method to enter the grove.
                </Text>

                {/* Social login options */}
                <Group grow mt="lg" gap="xs">
                  <Button
                    id="btn-google-login"
                    variant="default"
                    leftSection={<GoogleIcon />}
                    className={styles.socialBtn}
                    size="md"
                  >
                    Google
                  </Button>
                  <Button
                    id="btn-microsoft-login"
                    variant="default"
                    leftSection={<MicrosoftIcon />}
                    className={styles.socialBtn}
                    size="md"
                  >
                    Microsoft
                  </Button>
                </Group>

                <Divider
                  label="or continue with email"
                  labelPosition="center"
                  my="lg"
                  classNames={{ label: styles.dividerLabel }}
                />

                <form
                  onSubmit={loginForm.onSubmit((values) => {
                    console.log('Login:', values);
                  })}
                >
                  <Stack gap="md">
                    <TextInput
                      id="login-email"
                      label="Email"
                      placeholder="scholar@example.com"
                      type="email"
                      classNames={{
                        input: styles.input,
                        label: styles.inputLabel,
                      }}
                      {...loginForm.getInputProps('email')}
                    />
                    <PasswordInput
                      id="login-password"
                      label="Password"
                      placeholder="Your secret scroll…"
                      classNames={{
                        input: styles.input,
                        label: styles.inputLabel,
                      }}
                      {...loginForm.getInputProps('password')}
                    />
                    <Group justify="flex-end" mt={-8}>
                      <Anchor
                        href="#"
                        size="xs"
                        className={styles.forgotLink}
                        id="link-forgot-password"
                      >
                        Forgot password?
                      </Anchor>
                    </Group>
                    <Button
                      id="btn-login-submit"
                      type="submit"
                      className={styles.primaryBtn}
                      fullWidth
                      size="md"
                      mt="xs"
                    >
                      Enter the Grove
                    </Button>
                  </Stack>
                </form>

                <Text size="xs" ta="center" mt="lg" c="var(--bb-on-surface-variant)">
                  New to the grove?{' '}
                  <Anchor
                    component="button"
                    size="xs"
                    className={styles.switchTabLink}
                    id="link-switch-to-signup"
                    onClick={() => setActiveTab('signup')}
                  >
                    Create Account
                  </Anchor>
                </Text>
              </Stack>
            </Tabs.Panel>

            {/* ── Sign Up ── */}
            <Tabs.Panel value="signup">
              <Stack gap={0} mt="xl">
                <Title order={2} className={styles.formTitle}>
                  Begin your journey
                </Title>
                <Text size="sm" className={styles.formSub}>
                  Join thousands of scholars on the path to Mandarin mastery.
                </Text>

                {/* Social signup options */}
                <Group grow mt="lg" gap="xs">
                  <Button
                    id="btn-google-signup"
                    variant="default"
                    leftSection={<GoogleIcon />}
                    className={styles.socialBtn}
                    size="md"
                  >
                    Google
                  </Button>
                  <Button
                    id="btn-microsoft-signup"
                    variant="default"
                    leftSection={<MicrosoftIcon />}
                    className={styles.socialBtn}
                    size="md"
                  >
                    Microsoft
                  </Button>
                </Group>

                <Divider
                  label="or create with email"
                  labelPosition="center"
                  my="lg"
                  classNames={{ label: styles.dividerLabel }}
                />

                <form
                  onSubmit={signupForm.onSubmit((values) => {
                    console.log('Signup:', values);
                  })}
                >
                  <Stack gap="md">
                    <TextInput
                      id="signup-name"
                      label="Full Name"
                      placeholder="Your scholarly name"
                      classNames={{
                        input: styles.input,
                        label: styles.inputLabel,
                      }}
                      {...signupForm.getInputProps('name')}
                    />
                    <TextInput
                      id="signup-email"
                      label="Email"
                      placeholder="scholar@example.com"
                      type="email"
                      classNames={{
                        input: styles.input,
                        label: styles.inputLabel,
                      }}
                      {...signupForm.getInputProps('email')}
                    />
                    <PasswordInput
                      id="signup-password"
                      label="Password"
                      placeholder="At least 8 characters"
                      classNames={{
                        input: styles.input,
                        label: styles.inputLabel,
                      }}
                      {...signupForm.getInputProps('password')}
                    />
                    <Button
                      id="btn-signup-submit"
                      type="submit"
                      className={styles.primaryBtn}
                      fullWidth
                      size="md"
                      mt="xs"
                    >
                      Join the Pavilion
                    </Button>
                  </Stack>
                </form>

                <Text size="xs" ta="center" mt="lg" c="var(--bb-on-surface-variant)">
                  Already a scholar?{' '}
                  <Anchor
                    component="button"
                    size="xs"
                    className={styles.switchTabLink}
                    id="link-switch-to-login"
                    onClick={() => setActiveTab('login')}
                  >
                    Sign In
                  </Anchor>
                </Text>
              </Stack>
            </Tabs.Panel>
          </Tabs>

          {/* Legal footer */}
          <Group gap="xs" justify="center" mt="xl" pt="md" className={styles.legalRow}>
            <Anchor href="#" size="xs" className={styles.legalLink} id="link-honor-code">Honor Code</Anchor>
            <Text size="xs" c="var(--bb-outline)">·</Text>
            <Anchor href="#" size="xs" className={styles.legalLink} id="link-privacy">Privacy Scrolls</Anchor>
            <Text size="xs" c="var(--bb-outline)">·</Text>
            <Anchor href="#" size="xs" className={styles.legalLink} id="link-terms">Terms of Study</Anchor>
          </Group>
        </Paper>
      </div>
    </main>
  );
}
