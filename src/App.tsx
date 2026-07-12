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
import ThemeToggle from './components/ThemeToggle';

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
  // A stack of trade states: stateStack[0] is the starting state and the last
  // element is the current one. Keeping every snapshot lets us undo trades.
  const [stateStack, setStateStack] = useState<TradeState[]>(() => [
    initialTradeState(DEFAULT_INPUTS),
  ]);
  const state = stateStack[stateStack.length - 1];

  const Q = useMemo(
    () => buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota),
    [inputs.trades, inputs.winTrades, inputs.quota],
  );

  const summary = useMemo(() => computePlanSummary(inputs, Q), [inputs, Q]);
  const nextStake = started ? computeStake(Q, state) : 0;
  const complete = started && isProgressionComplete(inputs, state);

  function handleStart(newInputs: PlanInputs) {
    setInputs(newInputs);
    setStateStack([initialTradeState(newInputs)]);
    setHistory([]);
    setStarted(true);
  }

  function handleResult(result: 'W' | 'L') {
    const { step, nextState } = applyResult(inputs, Q, state, result);
    setHistory((h) => [...h, step]);
    setStateStack((s) => [...s, nextState]);
  }

  function handleUndo() {
    if (history.length === 0) return;
    setHistory((h) => h.slice(0, -1));
    setStateStack((s) => s.slice(0, -1));
  }

  function handleReset() {
    setStarted(false);
    setHistory([]);
    setStateStack([initialTradeState(inputs)]);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-titles">
          <h1>Masaniello Money Management</h1>
          <p className="subtitle">Binary options capital management calculator</p>
        </div>
        <ThemeToggle />
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
            onUndo={handleUndo}
            canUndo={history.length > 0}
            disabled={complete}
          />
          {complete && (
            <p className="complete-banner">
              Too many losses to reach the win target within this cycle. Use Undo to step back, or
              adjust the inputs above and start again to run a new plan.
            </p>
          )}
        </>
      )}
    </div>
  );
}
