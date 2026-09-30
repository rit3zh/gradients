import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GradientProfiler, type IGradientPerformanceReport } from '@rit3zh/gradients';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Scenarios, type IBenchmarkScenario } from './scenarios';
import { exportResults } from './exportResults';
import { useJsFrameCounter } from './useJsFrameCounter';
import type { Routes } from '../gallery/routes';
import { secondaryText } from '../gallery/theme';

const WarmupMs = 1000;
const MeasureMs = 3000;

interface IBenchmarkResult {
  scenario: IBenchmarkScenario;
  report: IGradientPerformanceReport;
  jsFps: number;
}

let activeSession: number | null = null;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function BenchmarkScreen({ route }: NativeStackScreenProps<Routes, 'Benchmark'>) {
  const insets = useSafeAreaInsets();
  const counter = useJsFrameCounter();
  const [current, setCurrent] = useState<number | null>(null);
  const [results, setResults] = useState<IBenchmarkResult[]>([]);
  const [savedTo, setSavedTo] = useState<string | null>(null);
  const session = useRef(0);

  useEffect(
    () => () => {
      session.current += 1;
      activeSession = null;
      if (GradientProfiler.isActive()) {
        GradientProfiler.stop();
      }
    },
    []
  );

  const filter = route.params?.scenario;
  const scenarios = useMemo(
    () => (filter ? Scenarios.filter((scenario) => scenario.id === filter) : Scenarios),
    [filter]
  );

  const run = useCallback(async () => {
    if (activeSession !== null) return;
    const id = ++session.current;
    activeSession = id;
    const collected: IBenchmarkResult[] = [];
    setResults([]);
    setSavedTo(null);

    for (let index = 0; index < scenarios.length; index++) {
      if (session.current !== id) return;
      setCurrent(index);
      await wait(WarmupMs);
      if (session.current !== id) return;
      counter.start();
      GradientProfiler.start();
      await wait(MeasureMs);
      const report = GradientProfiler.stop();
      const jsFps = counter.stop();
      collected.push({ scenario: scenarios[index], report, jsFps });
    }

    activeSession = null;
    setCurrent(null);
    setResults(collected);
    setSavedTo(
      exportResults({
        warmupMs: WarmupMs,
        measureMs: MeasureMs,
        results: collected.map(({ scenario, report, jsFps }) => ({
          id: scenario.id,
          jsFps,
          ...report,
        })),
      })
    );
  }, [counter, scenarios]);

  const autorun = route.params?.autorun;

  useEffect(() => {
    if (autorun === true || autorun === '1' || autorun === 'true') {
      run();
    }
  }, [autorun, run]);

  if (current !== null) {
    const scenario = scenarios[current];
    return (
      <View style={styles.stage}>
        {scenario.render()}
        <View pointerEvents="none" style={[styles.badge, { top: insets.top + 8 }]}>
          <Text style={styles.badgeText}>
            {current + 1}/{scenarios.length} · {scenario.name}
          </Text>
        </View>
      </View>
    );
  }

  const first = results[0]?.report;
  const displayRate = Math.max(60, ...results.map((result) => Math.round(result.report.fps)));

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
      <Text style={styles.lead}>
        Each scenario warms up for {WarmupMs / 1000}s, then the native profiler measures it for{' '}
        {MeasureMs / 1000}s.
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={run}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Text style={styles.buttonText}>{results.length ? 'Run again' : 'Run benchmark'}</Text>
      </Pressable>

      {savedTo && <Text style={styles.saved}>Saved to {savedTo}</Text>}

      {first && (
        <View style={styles.device}>
          <Text style={styles.deviceText}>{first.device}</Text>
          <Text style={styles.deviceMeta}>
            {first.gpuName}
            {first.simulator ? ' · simulator' : ''}
          </Text>
        </View>
      )}

      {results.map(({ scenario, report, jsFps }) => (
        <ResultRow
          key={scenario.id}
          scenario={scenario}
          report={report}
          jsFps={jsFps}
          displayRate={displayRate}
        />
      ))}
    </ScrollView>
  );
}

function ResultRow({
  scenario,
  report,
  jsFps,
  displayRate,
}: IBenchmarkResult & { displayRate: number }) {
  const idle = report.frames === 0;
  const ratio = report.fps / displayRate;
  const tone = idle
    ? styles.good
    : ratio >= 0.95
      ? styles.good
      : ratio >= 0.8
        ? styles.warn
        : styles.bad;
  const gpu = report.gpu ? `${ms(report.gpu.p50)} / ${ms(report.gpu.p95)}` : 'n/a';

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <View style={styles.rowTitle}>
          <Text style={styles.name}>{scenario.name}</Text>
          <Text style={styles.detail}>{scenario.detail}</Text>
        </View>
        <Text style={[styles.fps, tone]}>{idle ? 'idle' : `${Math.round(report.fps)} fps`}</Text>
      </View>
      <View style={styles.metrics}>
        <Metric label="cpu p50/p95" value={`${ms(report.cpu.p50)} / ${ms(report.cpu.p95)}`} />
        <Metric label="gpu p50/p95" value={gpu} />
        <Metric label="dropped" value={`${report.droppedFrames}`} />
        <Metric label="process cpu" value={`${Math.round(report.processCpu * 100)}%`} />
        <Metric label="gpu memory" value={`${(report.memory / 1048576).toFixed(1)} MB`} />
        <Metric label="js fps" value={`${Math.round(jsFps)}`} />
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ms(value: number) {
  return `${value.toFixed(2)} ms`;
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: '#000',
  },
  badge: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  screen: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  lead: {
    color: secondaryText,
    fontSize: 15,
    lineHeight: 21,
  },
  button: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  saved: {
    color: secondaryText,
    fontSize: 12,
  },
  device: {
    paddingVertical: 8,
  },
  deviceText: {
    color: '#F2F2F7',
    fontSize: 15,
    fontWeight: '600',
  },
  deviceMeta: {
    color: secondaryText,
    fontSize: 13,
    marginTop: 2,
  },
  row: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowTitle: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: '#F2F2F7',
    fontSize: 16,
    fontWeight: '600',
  },
  detail: {
    color: secondaryText,
    fontSize: 13,
  },
  fps: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  good: {
    color: '#30D158',
  },
  warn: {
    color: '#FFD60A',
  },
  bad: {
    color: '#FF453A',
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
  },
  metric: {
    width: '33.33%',
  },
  metricValue: {
    color: '#F2F2F7',
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    color: secondaryText,
    fontSize: 11,
    marginTop: 2,
  },
});
