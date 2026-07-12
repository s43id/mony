import type { PlanInputs, TradeState, TradeStep } from '../lib/masaniello';

interface Props {
  state: TradeState;
  inputs: PlanInputs;
  history: TradeStep[];
}

export default function StatsPanel({ state, inputs, history }: Props) {
  const totalWins = history.filter((s) => s.result === 'W').length;
  const totalLosses = history.filter((s) => s.result === 'L').length;
  const overallRatio = totalWins + totalLosses === 0 ? 0 : totalWins / (totalWins + totalLosses);

  return (
    <section className="panel">
      <h2>Winnigs</h2>
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-label">Trades Win (session)</span>
          <span className="stat-value">{totalWins}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Trades Loose (session)</span>
          <span className="stat-value">{totalLosses}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Overall Win Ratio</span>
          <span className="stat-value">{(overallRatio * 100).toFixed(1)}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Wins in Current Cycle</span>
          <span className="stat-value">
            {state.wins} / {inputs.winTrades}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Losses in Current Cycle</span>
          <span className="stat-value">
            {state.losses} / {inputs.trades - inputs.winTrades + 1}
          </span>
        </div>
      </div>
    </section>
  );
}
