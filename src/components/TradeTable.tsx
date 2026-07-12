import type { TradeStep } from '../lib/masaniello';

interface Props {
  history: TradeStep[];
  nextStake: number;
  capitalBefore: number;
  onResult: (result: 'W' | 'L') => void;
  disabled: boolean;
}

const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
// Signed money for the Return column (keeps the minus sign in front of the $).
const signedMoney = (n: number) =>
  `${n < 0 ? '-' : ''}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

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
              <td>{money(step.stake)}</td>
              <td className={step.result === 'W' ? 'positive' : 'negative'}>
                {step.result === 'W' ? signedMoney(step.profitIfWin) : signedMoney(-step.stake)}
              </td>
              <td>{money(step.capitalAfter)}</td>
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
              <td>{money(nextStake)}</td>
              <td>&mdash;</td>
              <td>{money(capitalBefore)}</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
