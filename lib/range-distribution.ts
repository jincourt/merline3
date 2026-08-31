export type ValueHistogram = {
  bins: number[];
  domainMin: number;
  domainMax: number;
  binSize: number;
  maxCount: number;
};

export function buildValueHistogram(
  values: number[],
  binCount = 22,
): ValueHistogram {
  if (values.length === 0) {
    return {
      bins: [],
      domainMin: 0,
      domainMax: 100,
      binSize: 5,
      maxCount: 1,
    };
  }

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const domainMin = rawMin === rawMax ? Math.max(0, rawMin - 1) : rawMin;
  const domainMax = rawMax === rawMin ? rawMax + 1 : rawMax;
  const span = domainMax - domainMin;
  const binSize = span / binCount;
  const bins = Array.from({ length: binCount }, () => 0);

  for (const value of values) {
    let index = Math.floor((value - domainMin) / binSize);
    if (index >= binCount) index = binCount - 1;
    if (index < 0) index = 0;
    bins[index] += 1;
  }

  return {
    bins,
    domainMin,
    domainMax,
    binSize,
    maxCount: Math.max(...bins, 1),
  };
}

export function clampRangeValue(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatRangeNumber(value: number) {
  return new Intl.NumberFormat("fr-CH", {
    maximumFractionDigits: 0,
  }).format(value);
}
