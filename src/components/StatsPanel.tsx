import type { PlanInputs, TradeState } from '../lib/masaniello';

interface Props {
  state: TradeState;
  inputs: PlanInputs;
}

// Session progress: wins toward the target and losses toward the point where
// the target is no longer reachable. Both thresholds come from the Trades /
// Win Trades inputs, so they double as the session's win/lose conditions.
export default function StatsPanel({ state, inputs }: Props) {
  const played = state.wins + state.losses;
  const winPct = played === 0 ? 0 : state.wins / played;
  const lossLimit = inputs.trades - inputs.winTrades + 1;

  return (
    <section className="panel">
      <h2>Winnigs</h2>
      <div className="stat-grid">
        <div className="stat">
          <span className="stat-label">Wins (need {inputs.winTrades} to win)</span>
          <span className="stat-value">
            {state.wins} / {inputs.winTrades}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Losses ({lossLimit} loses the session)</span>
          <span className="stat-value">
            {state.losses} / {lossLimit}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Trades Played</span>
          <span className="stat-value">
            {played} / {inputs.trades}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Win Rate</span>
          <span className="stat-value">{(winPct * 100).toFixed(1)}%</span>
        </div>
      </div>
    </section>
  );
}
