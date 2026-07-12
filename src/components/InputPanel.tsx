import { useState, type FormEvent } from 'react';
import type { PlanInputs } from '../lib/masaniello';

interface Props {
  inputs: PlanInputs;
  disabled: boolean;
  onStart: (inputs: PlanInputs) => void;
  onReset?: () => void;
}

type FormState = { [K in keyof PlanInputs]: string };

function toFormState(inputs: PlanInputs): FormState {
  return {
    initialCapital: String(inputs.initialCapital),
    trades: String(inputs.trades),
    winTrades: String(inputs.winTrades),
    quota: String(inputs.quota),
    withdrawPct: String(inputs.withdrawPct),
  };
}

export default function InputPanel({ inputs, disabled, onStart, onReset }: Props) {
  const [form, setForm] = useState<FormState>(toFormState(inputs));
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(parsed: PlanInputs): string | null {
    if (!(parsed.initialCapital > 0)) return 'Initial Capital must be greater than 0.';
    if (!(Number.isInteger(parsed.trades) && parsed.trades >= 1 && parsed.trades <= 100))
      return 'Trades must be a whole number between 1 and 100.';
    if (!(parsed.winTrades > 0 && parsed.winTrades < parsed.trades + 1))
      return 'Win Trades must be greater than 0 and no more than Trades.';
    if (!(parsed.quota > 1)) return 'Winning Ratio must be greater than 1.';
    if (!(parsed.withdrawPct >= 0 && parsed.withdrawPct <= 100))
      return '% to Reinvest must be between 0 and 100.';
    return null;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed: PlanInputs = {
      initialCapital: Number(form.initialCapital),
      trades: Number(form.trades),
      winTrades: Number(form.winTrades),
      quota: Number(form.quota),
      withdrawPct: Number(form.withdrawPct),
    };
    if (Object.values(parsed).some((v) => Number.isNaN(v))) {
      setError('All fields must be valid numbers.');
      return;
    }
    const validationError = validate(parsed);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onStart(parsed);
  }

  return (
    <form className="panel input-panel" onSubmit={handleSubmit}>
      <h2>Plan</h2>
      <div className="field-grid">
        <label>
          Initial Capital
          <input
            type="number"
            step="any"
            min="0"
            disabled={disabled}
            value={form.initialCapital}
            onChange={(e) => set('initialCapital', e.target.value)}
          />
        </label>
        <label>
          Trades
          <input
            type="number"
            step="1"
            min="1"
            max="100"
            disabled={disabled}
            value={form.trades}
            onChange={(e) => set('trades', e.target.value)}
          />
        </label>
        <label>
          Win Trades
          <input
            type="number"
            step="1"
            min="1"
            disabled={disabled}
            value={form.winTrades}
            onChange={(e) => set('winTrades', e.target.value)}
          />
        </label>
        <label>
          Winning Ratio (quota)
          <input
            type="number"
            step="any"
            min="1"
            disabled={disabled}
            value={form.quota}
            onChange={(e) => set('quota', e.target.value)}
          />
        </label>
        <label>
          % to Reinvest
          <input
            type="number"
            step="any"
            min="0"
            max="100"
            disabled={disabled}
            value={form.withdrawPct}
            onChange={(e) => set('withdrawPct', e.target.value)}
          />
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        {!disabled && (
          <button type="submit" className="primary">
            Start Plan
          </button>
        )}
        {onReset && (
          <button type="button" onClick={onReset}>
            Reset
          </button>
        )}
      </div>
    </form>
  );
}
