import type { PlanInputs, PlanSummary } from '../lib/masaniello';

interface Props {
  summary: PlanSummary;
  inputs: PlanInputs;
}

const currency = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });
const percent = (n: number) => `${(n * 100).toFixed(2)}%`;

export default function PlanSummaryView({ summary, inputs }: Props) {
  return (
    <section className="panel">
      <h2>MM Plan</h2>
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-label">Intial Capital</span>
          <span className="stat-value">{currency(inputs.initialCapital)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Capital Final</span>
          <span className="stat-value">{currency(summary.capitalFinal)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Performance</span>
          <span className="stat-value">{percent(summary.performance)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Winnings</span>
          <span className="stat-value">{currency(summary.winnings)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Target Win Ratio</span>
          <span className="stat-value">{percent(summary.targetWinRatio)}</span>
        </div>
      </div>
    </section>
  );
}
