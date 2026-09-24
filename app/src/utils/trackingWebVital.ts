type MetricName = "CLS" | "FID" | "INP" | "LCP" | "FCP" | "TTFB";
type Rating = "good" | "needs improvement" | "poor";

interface Metric {
  id: string;
  name: MetricName | string;
  value: number;
  version?: string;
  country?: string;
}

interface RatedMetric extends Metric {
  rating: Rating;
}

// Ngưỡng chuẩn theo Web Vitals (đơn vị: ms, trừ CLS không có đơn vị)
const THRESHOLDS: Record<
  MetricName,
  { good: number; needsImprovement: number }
> = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  INP: { good: 200, needsImprovement: 500 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

function getRating(name: string, value: number): Rating {
  const threshold = THRESHOLDS[name as MetricName];

  // Nếu không có ngưỡng định nghĩa cho metric này
  if (!threshold) return "poor"; // hoặc bạn có thể throw error / return "unknown"

  return value <= threshold.good
    ? "good"
    : value <= threshold.needsImprovement
      ? "needs improvement"
      : "poor";
}

function rateMetrics(data: { metrics: Metric[] }): RatedMetric[] {
  return data.metrics.map((metric) => ({
    ...metric,
    rating: getRating(metric.name, metric.value),
  }));
}

/**
 * Callback function for processing Web Vitals metrics.
 * @param {Object} metrics - The metrics object containing Web Vitals data.
 * @param {string} metrics.appId - Identifier for the app (e.g., "gid://shopify/App/1").
 * @param {string} metrics.shopId - Identifier for the shop (e.g., "10").
 * @param {string} metrics.userId - Identifier for the user (e.g., "5").
 * @param {string} metrics.appLoadId - Unique identifier for the current app load session.
 * @param {Array<Object>} metrics.metrics - Array of Web Vitals metrics.
 * @param {string} metrics.metrics[].id - Unique identifier for the metric.
 * @param {string} metrics.metrics[].name - Name of the metric (e.g., "LCP", "FCP", "CLS").
 * @param {number} metrics.metrics[].value - Value of the metric (can be integer or float).
 */
export function processWebVitals(metrics: { metrics: Metric[] }) {
  const result = rateMetrics(metrics);
  console.log(result);
}
