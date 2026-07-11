import type { ArrayAlgorithmStep } from '../shared/types';
import { tagWithIds } from '../shared/arrayElements';
import { generateRandomArray } from '../shared/generateRandomInput';
import type { InterviewProblemDefinition } from './types';

/**
 * Single pass, tracking the lowest price seen so far and the best
 * profit achievable by selling today given that minimum. Same
 * "track a running best" shape as Kadane's, which is worth pointing
 * out in an interview: both are single-pass O(n) problems that look
 * unrelated but reduce to the same technique.
 */
function* bestTimeGenerator(prices: number[]): Generator<ArrayAlgorithmStep> {
  const arr = tagWithIds(prices);

  let minPriceIndex = 0;
  let bestProfit = 0;
  let buyIndex = 0;
  let sellIndex = 0;

  yield { type: 'mark-active', index: 0, array: [...arr] };

  for (let i = 1; i < arr.length; i++) {
    yield { type: 'compare', indices: [minPriceIndex, i], array: [...arr] };

    const profitIfSoldToday = arr[i].value - arr[minPriceIndex].value;
    if (profitIfSoldToday > bestProfit) {
      bestProfit = profitIfSoldToday;
      buyIndex = minPriceIndex;
      sellIndex = i;
      yield { type: 'mark-result', indices: [buyIndex, sellIndex], array: [...arr] };
    }

    if (arr[i].value < arr[minPriceIndex].value) {
      minPriceIndex = i;
      yield { type: 'mark-active', index: minPriceIndex, array: [...arr] };
    }
  }

  yield {
    type: 'done',
    array: [...arr],
    outcome: 'result',
    indices: bestProfit > 0 ? [buyIndex, sellIndex] : [],
    resultLabel:
      bestProfit > 0
        ? `Buy on day ${buyIndex}, sell on day ${sellIndex} — profit = ${bestProfit}.`
        : 'No profitable trade exists — prices only fall.',
  };
}

export const bestTimeToBuySellStock: InterviewProblemDefinition<number[]> = {
  id: 'best-time-to-buy-and-sell-stock',
  name: 'Best Time to Buy and Sell Stock',
  category: 'interview',
  visualizationType: 'array',
  difficulty: 'beginner',
  description:
    'Given a price on each day, find the single buy day and sell day (buy before sell) that maximizes profit.',
  topics: ['Array', 'Greedy', 'Dynamic Programming'],
  problemStatement:
    'You are given an array where element i is the price of a stock on day i. Choose one day to buy and a later day to sell to maximize profit. If no profit is possible, return 0.',
  example: {
    input: '[7, 1, 5, 3, 6, 4]',
    output: '5',
    explanation: 'Buy on day 1 (price 1), sell on day 4 (price 6): profit = 5.',
  },
  complexity: {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
  },
  pseudocode: [
    'minPrice = prices[0]; bestProfit = 0',
    'for i from 1 to n - 1:',
    '  if prices[i] - minPrice > bestProfit:',
    '    bestProfit = prices[i] - minPrice; record buy/sell day',
    '  if prices[i] < minPrice:',
    '    minPrice = prices[i]',
    'return bestProfit',
  ],
  pseudocodeLineMap: {
    compare: 1,
    'mark-result': 3,
    'mark-active': 5,
  },
  generateRandomInput: (size: number) => generateRandomArray(size, 1, 50),
  run: bestTimeGenerator,
};
