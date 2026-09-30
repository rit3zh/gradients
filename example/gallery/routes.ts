export type Routes = {
  Gallery: undefined;
  Detail: { name: string };
  Benchmark: { autorun?: boolean | string; scenario?: string } | undefined;
};
