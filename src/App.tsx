import { useMemo, useState } from 'react';
import {
  applyResult,
  buildQuotaMatrix,
  computePlanSummary,
  computeStake,
  initialTradeState,
  isProgressionComplete,
  type PlanInputs,
  type TradeState,
  type TradeStep,
} from './lib/masaniello';
import InputPanel from './components/InputPanel';
import PlanSummaryView from './components/PlanSummary';
import TradeTable from './components/TradeTable';
import StatsPanel from './components/StatsPanel';

const DEFAULT_INPUTS: PlanInputs = {
  initialCapital: 20,
  trades: 5,
  winTrades: 2,
  quota: 1.75,
  withdrawPct: 100,
};

export default function App() {
  const [inputs, setInputs] = useState<PlanInputs>(DEFAULT_INPUTS);
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState<TradeStep[]>([]);
  const [state, setState] = useState<TradeState>(() => initialTradeState(DEFAULT_INPUTS));

  const Q = useMemo(
    () => buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota),
    [inputs.trades, inputs.winTrades, inputs.quota],
  );

  const summary = useMemo(() => computePlanSummary(inputs, Q), [inputs, Q]);
  const nextStake = started ? computeStake(Q, state) : 0;
  const complete = started && isProgressionComplete(inputs, state);

  function handleStart(newInputs: PlanInputs) {
    setInputs(newInputs);
    setState(initialTradeState(newInputs));
    setHistory([]);
    setStarted(true);
  }

  function handleResult(result: 'W' | 'L') {
    const Qcurrent = buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota);
    const { step, nextState } = applyResult(inputs, Qcurrent, state, result);
    setHistory((h) => [...h, step]);
    setState(nextState);
  }

  function handleReset() {
    setStarted(false);
    setHistory([]);
    setState(initialTradeState(inputs));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Masaniello Money Management</h1>
        <p className="subtitle">Binary options capital management calculator</p>
      </header>

      <InputPanel
        inputs={inputs}
        disabled={started}
        onStart={handleStart}
        onReset={started ? handleReset : undefined}
      />

      {started && (
        <>
          <PlanSummaryView summary={summary} inputs={inputs} />
          <StatsPanel state={state} inputs={inputs} history={history} />
          <TradeTable
            history={history}
            nextStake={nextStake}
            capitalBefore={state.capital}
            onResult={handleResult}
            disabled={complete}
          />
          {complete && (
            <p className="complete-banner">
              Too many losses to reach the win target within this cycle. Adjust the inputs above
              and start again to run a new plan.
            </p>
          )}
        </>
      )}
    </div>
  );
}
