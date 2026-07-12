import type { TradeStep } from '../lib/masaniello';

interface Props {
  history: TradeStep[];
  nextStake: number;
  capitalBefore: number;
  onResult: (result: 'W' | 'L') => void;
  disabled: boolean;
}

const num = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function TradeTable({ history, nextStake, capitalBefore, onResult, disabled }: Props) {
  return (
    <section className="panel">
      <h2>Trades</h2>
      <table className="trade-table">
        <thead>
          <tr>
            <th>Trade No</th>
            <th>Result</th>
            <th>Investment</th>
            <th>Return</th>
            <th>Total Value</th>
          </tr>
        </thead>
        <tbody>
          {history.map((step, i) => (
            <tr key={i} className={step.result === 'W' ? 'row-win' : 'row-loss'}>
              <td>{i + 1}</td>
              <td>{step.result}</td>
              <td>{num(step.stake)}</td>
              <td className={step.result === 'W' ? 'positive' : 'negative'}>
                {step.result === 'W' ? num(step.profitIfWin) : num(-step.stake)}
              </td>
              <td>{num(step.capitalAfter)}</td>
            </tr>
          ))}
          {!disabled && (
            <tr className="row-pending">
              <td>{history.length + 1}</td>
              <td className="pending-actions">
                <button type="button" className="win" onClick={() => onResult('W')}>
                  W
                </button>
                <button type="button" className="loss" onClick={() => onResult('L')}>
                  L
                </button>
              </td>
              <td>{num(nextStake)}</td>
              <td>&mdash;</td>
              <td>{num(capitalBefore)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
