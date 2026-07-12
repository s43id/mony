/**
 * Masaniello-method money management engine.
 * Ported from Money-2.xlsx ("Dollar MM" / "Dollar MM1" sheets).
 * Framework-agnostic: no DOM or Electron dependencies, safe to reuse as-is
 * in a future Capacitor (Android) or other build.
 */

export interface PlanInputs {
  initialCapital: number;
  trades: number;
  winTrades: number;
  quota: number;
  withdrawPct: number;
}

export type QuotaMatrix = number[][];

/**
 * Backward-induction quota matrix. Q[level][wins] is the multiplier
 * representing the odds-adjusted value of being at `wins` wins after
 * `level` trials, working back from the terminal levels.
 */
export function buildQuotaMatrix(trades: number, winTrades: number, quota: number): QuotaMatrix {
  const Q: QuotaMatrix = Array.from({ length: trades + 1 }, () =>
    new Array<number>(winTrades + 1).fill(NaN),
  );

  for (let level = trades; level >= 0; level--) {
    for (let wins = 0; wins <= winTrades; wins++) {
      const remainingTrials = trades - level;
      const remainingWinsNeeded = winTrades - wins;

      if (remainingWinsNeeded === 0) {
        Q[level][wins] = 1;
      } else if (remainingWinsNeeded === remainingTrials) {
        Q[level][wins] = quota ** remainingTrials;
      } else if (remainingWinsNeeded > remainingTrials) {
        Q[level][wins] = NaN;
      } else {
        const loss = Q[level + 1][wins];
        const win = Q[level + 1][wins + 1];
        Q[level][wins] = (quota * loss * win) / (loss + (quota - 1) * win);
      }
    }
  }

  return Q;
}

export interface PlanSummary {
  capitalFinal: number;
  performance: number;
  winnings: number;
  targetWinRatio: number;
}

export function computePlanSummary(inputs: PlanInputs, Q: QuotaMatrix): PlanSummary {
  const performance = Q[0][0] - 1;
  const capitalFinal = inputs.initialCapital + inputs.initialCapital * performance;
  const winnings = capitalFinal - inputs.initialCapital;
  const targetWinRatio = inputs.winTrades / inputs.trades;
  return { capitalFinal, performance, winnings, targetWinRatio };
}

export interface TradeState {
  capital: number;
  maxCapital: number;
  losses: number;
  wins: number;
}

export function initialTradeState(inputs: PlanInputs): TradeState {
  return {
    capital: inputs.initialCapital,
    maxCapital: inputs.initialCapital,
    losses: 0,
    wins: 0,
  };
}

export interface TradeStep {
  stake: number;
  profitIfWin: number;
  result: 'W' | 'L';
  capitalAfter: number;
  maxCapitalAfter: number;
  winsAfter: number;
  lossesAfter: number;
  winRatioAfter: number;
}

/**
 * True once too many losses have accumulated for the win target to still be
 * reachable within the remaining trades of the current cycle (a "bust").
 * Reaching the win target itself does not stop the progression: wins/losses
 * reset to zero and a fresh cycle begins on the same running capital (see
 * `applyResult`), matching the xlsx's default (L4=0) continuous mode.
 */
export function isProgressionComplete(inputs: PlanInputs, state: TradeState): boolean {
  return state.losses > inputs.trades - inputs.winTrades;
}

/**
 * Computes the recommended stake for the *next* trade given the current
 * state. Ported from the xlsx: stakeFactor = 1 - Q[level][wins] / Q[level+1][wins],
 * i.e. how much the quota value would drop between this level and the next
 * if this trade were lost.
 */
export function computeStake(Q: QuotaMatrix, state: TradeState): number {
  const level = state.losses + state.wins;
  const current = Q[level][state.wins];
  const next = Q[level + 1]?.[state.wins];

  const stakeFactor = next === undefined ? NaN : 1 - current / next;

  return Number.isFinite(stakeFactor) ? stakeFactor * state.capital : state.capital;
}

export function applyResult(
  inputs: PlanInputs,
  Q: QuotaMatrix,
  state: TradeState,
  result: 'W' | 'L',
): { step: TradeStep; nextState: TradeState } {
  const stake = computeStake(Q, state);
  const isWin = result === 'W';
  const profitIfWin = stake * (inputs.quota - 1);

  let capitalAfter: number;
  if (!isWin) {
    capitalAfter = state.capital - stake;
  } else if (state.capital + profitIfWin >= state.maxCapital) {
    const excess = state.capital + profitIfWin - state.maxCapital;
    capitalAfter = state.maxCapital + (excess * inputs.withdrawPct) / 100;
  } else {
    capitalAfter = state.capital + profitIfWin;
  }

  const maxCapitalAfter = Math.max(capitalAfter, state.maxCapital);
  const winRatioAfter = ((isWin ? 1 : 0) + state.wins) / (state.losses + state.wins + 1);

  let winsAfter = state.wins + (isWin ? 1 : 0);
  let lossesAfter = state.losses + (isWin ? 0 : 1);
  if (winsAfter >= inputs.winTrades) {
    // Target reached: a fresh progression starts on the next trade.
    winsAfter = 0;
    lossesAfter = 0;
  }

  const step: TradeStep = {
    stake,
    profitIfWin,
    result,
    capitalAfter,
    maxCapitalAfter,
    winsAfter,
    lossesAfter,
    winRatioAfter,
  };

  const nextState: TradeState = {
    capital: capitalAfter,
    maxCapital: maxCapitalAfter,
    losses: lossesAfter,
    wins: winsAfter,
  };

  return { step, nextState };
}
