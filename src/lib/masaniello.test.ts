import { describe, expect, it } from 'vitest';
import {
  applyResult,
  buildQuotaMatrix,
  computePlanSummary,
  computeStake,
  initialTradeState,
  isProgressionComplete,
  type PlanInputs,
} from './masaniello';

// Fixture values taken directly from Money-2.xlsx's cached cell results
// (Initial Capital 20, Trades 5, Win Trades 2, Quota 1.75, 100% reinvest).
const inputs: PlanInputs = {
  initialCapital: 20,
  trades: 5,
  winTrades: 2,
  quota: 1.75,
  withdrawPct: 100,
};

describe('buildQuotaMatrix', () => {
  it('matches the xlsx cached Q[0][0] (used for performance)', () => {
    const Q = buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota);
    expect(Q[0][0]).toBeCloseTo(1.1246654175588866, 12);
  });
});

describe('computePlanSummary', () => {
  it('matches the xlsx MM Plan panel (J12/J13/J14)', () => {
    const Q = buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota);
    const summary = computePlanSummary(inputs, Q);
    expect(summary.performance).toBeCloseTo(0.1246654175588866, 12);
    expect(summary.capitalFinal).toBeCloseTo(22.493308351177731, 9);
    expect(summary.winnings).toBeCloseTo(2.4933083511777312, 9);
    expect(summary.targetWinRatio).toBeCloseTo(0.4, 12); // K8 = J8/J7
  });
});

describe('computeStake', () => {
  it('matches the xlsx first-trade stake (E6)', () => {
    const Q = buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota);
    const state = initialTradeState(inputs);
    const stake = computeStake(Q, state);
    expect(stake).toBeCloseTo(2.3126338329764429, 9);
  });

  it('bets the full remaining capital when a loss would make the target unreachable', () => {
    const Q = buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota);
    let state = initialTradeState(inputs);
    // Lose the first three trades: now at level 3, wins 0 -- must win both remaining trades.
    ({ nextState: state } = applyResult(inputs, Q, state, 'L'));
    ({ nextState: state } = applyResult(inputs, Q, state, 'L'));
    ({ nextState: state } = applyResult(inputs, Q, state, 'L'));
    const stake = computeStake(Q, state);
    expect(stake).toBeCloseTo(state.capital, 9);
  });
});

describe('applyResult', () => {
  it('reduces capital by the stake on a loss', () => {
    const Q = buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota);
    const state = initialTradeState(inputs);
    const { step, nextState } = applyResult(inputs, Q, state, 'L');
    expect(nextState.capital).toBeCloseTo(state.capital - step.stake, 9);
    expect(nextState.losses).toBe(1);
    expect(nextState.wins).toBe(0);
  });

  it('increases capital by stake * (quota - 1) on a win below the running max', () => {
    const Q = buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota);
    const state = initialTradeState(inputs);
    const { step, nextState } = applyResult(inputs, Q, state, 'W');
    expect(step.profitIfWin).toBeCloseTo(step.stake * (inputs.quota - 1), 9);
    expect(nextState.capital).toBeCloseTo(state.capital + step.profitIfWin, 9);
    expect(nextState.wins).toBe(1);
  });

  it('resets wins/losses to zero once the win target is reached', () => {
    const Q = buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota);
    let state = initialTradeState(inputs);
    ({ nextState: state } = applyResult(inputs, Q, state, 'W'));
    expect(state.wins).toBe(1);
    ({ nextState: state } = applyResult(inputs, Q, state, 'W'));
    expect(state.wins).toBe(0);
    expect(state.losses).toBe(0);
  });

  it('computes the running win ratio like column J', () => {
    const Q = buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota);
    const state = initialTradeState(inputs);
    const { step } = applyResult(inputs, Q, state, 'W');
    expect(step.winRatioAfter).toBeCloseTo(1, 12); // (1+0)/(0+0+1)
  });

  it('does not stop the progression when the win target is hit -- it resets and continues', () => {
    const Q = buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota);
    let state = initialTradeState(inputs);
    ({ nextState: state } = applyResult(inputs, Q, state, 'W'));
    ({ nextState: state } = applyResult(inputs, Q, state, 'W'));
    expect(state.wins).toBe(0);
    expect(isProgressionComplete(inputs, state)).toBe(false);
  });
});

describe('isProgressionComplete', () => {
  it('is false while the win target is still reachable', () => {
    const Q = buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota);
    let state = initialTradeState(inputs);
    ({ nextState: state } = applyResult(inputs, Q, state, 'L'));
    ({ nextState: state } = applyResult(inputs, Q, state, 'L'));
    ({ nextState: state } = applyResult(inputs, Q, state, 'L'));
    expect(isProgressionComplete(inputs, state)).toBe(false);
  });

  it('is true once losses make the win target unreachable within the cycle', () => {
    const Q = buildQuotaMatrix(inputs.trades, inputs.winTrades, inputs.quota);
    let state = initialTradeState(inputs);
    ({ nextState: state } = applyResult(inputs, Q, state, 'L'));
    ({ nextState: state } = applyResult(inputs, Q, state, 'L'));
    ({ nextState: state } = applyResult(inputs, Q, state, 'L'));
    ({ nextState: state } = applyResult(inputs, Q, state, 'L'));
    expect(isProgressionComplete(inputs, state)).toBe(true);
  });
});
