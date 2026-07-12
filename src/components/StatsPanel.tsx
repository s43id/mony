import type { PlanInputs, TradeState, TradeStep } from '../lib/masaniello';

interface Props {
  state: TradeState;
  inputs: PlanInputs;
  history: TradeStep[];
}

// Mirrors the win/loss block on the "Dollar MM" sheet (I17/I18 with the
// COUNTIF-based counts J17/J18 and the K17/K18 percentages), plus the running
// cycle counters (the H/I columns of the hidden "Dollar MM1" sheet).
export default function StatsPanel({ state, inputs, history }: Props) {
  const totalWins = history.filter((s) => s.result === 'W').length;
  const totalLosses = history.filter((s) => s.result === 'L').length;
  const played = totalWins + totalLosses;
  const winPct = played === 0 ? 0 : totalWins / played;
  const lossPct = played === 0 ? 0 : totalLosses / played;

  return (
    <section className="panel">
      <h2>Winnigs</h2>
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-label">Trades Win</span>
          <span className="stat-value">
            {totalWins} <small>({(winPct * 100).toFixed(1)}%)</small>
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Trades Loose</span>
          <span className="stat-value">
            {totalLosses} <small>({(lossPct * 100).toFixed(1)}%)</small>
          </span>
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
