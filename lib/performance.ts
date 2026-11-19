/**
 * Variant View scorecard math: how has each pick done since we published
 * it, compared with the S&P 500 over the same period?
 */
import type { VariantPick } from "./content";
import { isoDaysAgo, valueOnOrBefore } from "./fred";
import { getDailyCloses } from "./marketData";

export interface PickPerformance {
  /** Latest closing price */
  current: number;
  /** Our return since publication (flipped for Short picks, so up = we were right) */
  pickReturn: number;
  /** S&P 500 return over the same period */
  spxReturn: number;
  /** pickReturn − spxReturn: did we beat the market? */
  excess: number;
  /** Daily cumulative returns since publication, for the comparison chart */
  series: { date: string; pick: number; spx: number }[];
  /** Daily closes from ~6 weeks before publication, for the price chart */
  prices: { date: string; value: number }[];
  asOfDate: string;
  isSample: boolean;
}

export async function getPickPerformance(pick: VariantPick): Promise<PickPerformance> {
  // Start ~6 weeks before publication: gives the price chart some context,
  // and guarantees an S&P close on or before publish day.
  const from = isoDaysAgo(45, new Date(`${pick.published}T12:00:00Z`));

  const [stock, spx] = await Promise.all([
    getDailyCloses(pick.ticker, from, { date: pick.published, price: pick.priceAtPublication }),
    getDailyCloses("SPX", from),
  ]);

  const spxBase = valueOnOrBefore(spx.data, pick.published)?.value ?? spx.data[0]?.value ?? 1;
  const sign = pick.stance === "Short" ? -1 : 1;

  const series = stock.data
    .filter((d) => d.date >= pick.published)
    .map((d) => {
      const spxClose = valueOnOrBefore(spx.data, d.date)?.value ?? spxBase;
      return {
        date: d.date,
        pick: sign * (d.value / pick.priceAtPublication - 1),
        spx: spxClose / spxBase - 1,
      };
    });

  const lastStock = stock.data.at(-1);
  const current = lastStock?.value ?? pick.priceAtPublication;
  const pickReturn = sign * (current / pick.priceAtPublication - 1);
  const spxReturn = (spx.data.at(-1)?.value ?? spxBase) / spxBase - 1;

  return {
    current,
    pickReturn,
    spxReturn,
    excess: pickReturn - spxReturn,
    series: series.length > 0 ? series : [{ date: pick.published, pick: 0, spx: 0 }],
    prices: stock.data,
    asOfDate: lastStock?.date ?? pick.published,
    isSample: stock.isSample || spx.isSample,
  };
}
