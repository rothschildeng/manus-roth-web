import { callDataApi } from "./_core/dataApi";

export const ROTH_DIGITAL_ANALYTICS_DOMAIN = "aureliastore-fhmpjk85.manus.space";

export type SimilarWebDatasetKey = "globalRank" | "visits" | "uniqueVisitors" | "bounceRate" | "trafficSources" | "countries";

export type SimilarWebOverview = {
  domain: string;
  period: { startDate: string; endDate: string };
  fetchedAt: Date;
  datasets: Partial<Record<SimilarWebDatasetKey, unknown>>;
  unavailable: Array<{ dataset: SimilarWebDatasetKey; reason: string }>;
};

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function getLatestCompleteMonthlyWindow(now = new Date()) {
  const lastCompleteMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const firstMonth = new Date(Date.UTC(lastCompleteMonth.getUTCFullYear(), lastCompleteMonth.getUTCMonth() - 2, 1));
  return { startDate: monthKey(firstMonth), endDate: monthKey(lastCompleteMonth) };
}

function compactReason(error: unknown): string {
  if (!(error instanceof Error)) return "The provider did not return a report.";
  return error.message.replace(/Bearer\s+[^\s]+/gi, "Bearer [redacted]").slice(0, 180);
}

export async function getSimilarWebOverview(domain = ROTH_DIGITAL_ANALYTICS_DOMAIN): Promise<SimilarWebOverview> {
  const period = getLatestCompleteMonthlyWindow();
  const requests: Array<[SimilarWebDatasetKey, Promise<unknown>]> = [
    ["globalRank", callDataApi("SimilarWeb/get_global_rank", { pathParams: { domain } })],
    ["visits", callDataApi("SimilarWeb/get_visits_total", { pathParams: { domain }, query: { country: "world", granularity: "monthly", start_date: period.startDate, end_date: period.endDate } })],
    ["uniqueVisitors", callDataApi("SimilarWeb/get_unique_visit", { pathParams: { domain }, query: { start_date: period.startDate, end_date: period.endDate } })],
    ["bounceRate", callDataApi("SimilarWeb/get_bounce_rate", { pathParams: { domain }, query: { country: "world", granularity: "monthly", start_date: period.startDate, end_date: period.endDate } })],
    ["trafficSources", callDataApi("SimilarWeb/get_traffic_sources_desktop", { pathParams: { domain }, query: { country: "world", granularity: "monthly", start_date: period.startDate, end_date: period.endDate } })],
    ["countries", callDataApi("SimilarWeb/get_total_traffic_by_country", { pathParams: { domain }, query: { start_date: period.startDate, end_date: period.endDate, limit: "10" } })],
  ];
  const results = await Promise.allSettled(requests.map(([, request]) => request));
  const datasets: SimilarWebOverview["datasets"] = {};
  const unavailable: SimilarWebOverview["unavailable"] = [];

  results.forEach((result, index) => {
    const [dataset] = requests[index];
    if (result.status === "fulfilled") datasets[dataset] = result.value;
    else unavailable.push({ dataset, reason: compactReason(result.reason) });
  });

  return { domain, period, fetchedAt: new Date(), datasets, unavailable };
}
