import { File, Paths } from 'expo-file-system';

export const ResultsFileName = 'gradients-benchmark.json';

const Tag = '[@rit3zh/gradients/benchmark]';

interface IExportPayload {
  warmupMs: number;
  measureMs: number;
  results: { id: string }[];
}

export function exportResults(payload: IExportPayload) {
  console.log(`${Tag} begin ${payload.results.length} ${payload.warmupMs} ${payload.measureMs}`);
  for (const result of payload.results) {
    console.log(`${Tag} result ${JSON.stringify(result)}`);
  }
  console.log(`${Tag} end`);

  try {
    const file = new File(Paths.document, ResultsFileName);
    if (file.exists) {
      file.delete();
    }
    file.create();
    file.write(JSON.stringify(payload));
    return file.uri;
  } catch {
    return null;
  }
}
