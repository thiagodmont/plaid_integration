const {
  consolidateTransaction,
  calculateTimesAccountPositiveBalance
} = require('./financialUtils')

describe('fn: consolidateTransaction', () => {
  test('Consolidate transactions with empty transactions and positive initial balance', () => {
    const initialBalance = 100

    const mockedTransactions = []

    const result = consolidateTransaction({ initialBalance, transactions: mockedTransactions })

    expect(result).toStrictEqual([]);
  });

  test('Consolidate transactions with all positives', () => {
    const initialBalance = 100

    const mockedTransactions = [
      { transaction_id: '3', date: '2024-07-06', amount: 75 }, // 175
      { transaction_id: '2', date: '2024-07-03', amount: -50 }, // 125
      { transaction_id: '1', date: '2024-07-01', amount: 100 }, // 225
    ]

    const result = consolidateTransaction({ initialBalance, transactions: mockedTransactions })

    expect(result).toStrictEqual([
      { date: "2024-07-06", amount: 75, previousBalance: 100, currentBalance: 175 },
      { date: "2024-07-03", amount: -50, previousBalance: 175, currentBalance: 125 },
      { date: "2024-07-01", amount: 100, previousBalance: 125, currentBalance: 225 },
    ]);
  });

  test('Consolidate transactions with all negatives', () => {
    const initialBalance = 100

    const mockedTransactions = [
      { transaction_id: '3', date: '2024-07-06', amount: -150 }, // -50
      { transaction_id: '2', date: '2024-07-03', amount: 20 }, // -30
      { transaction_id: '1', date: '2024-07-01', amount: 10 }, // -20
    ]

    const result = consolidateTransaction({ initialBalance, transactions: mockedTransactions })

    expect(result).toStrictEqual([
      { date: "2024-07-06", amount: -150, previousBalance: 100, currentBalance: -50 },
      { date: "2024-07-03", amount: 20, previousBalance: -50, currentBalance: -30 },
      { date: "2024-07-01", amount: 10, previousBalance: -30, currentBalance: -20 },
    ]);
  });

  test('Consolidate transactions with going from positive to negative and positive again', () => {
    const initialBalance = 100

    const mockedTransactions = [
      { transaction_id: '7', date: '2024-07-06', amount: 20 }, // 120
      { transaction_id: '6', date: '2024-07-03', amount: -100 }, // 20
      { transaction_id: '5', date: '2024-07-01', amount: 10 }, // 30
      { transaction_id: '4', date: '2024-06-28', amount: -50 }, // -20
      { transaction_id: '3', date: '2024-06-26', amount: -10 }, // -30
      { transaction_id: '2', date: '2024-06-24', amount: 40 }, // 10
      { transaction_id: '1', date: '2024-06-22', amount: 15 }, // 25
    ]

    const result = consolidateTransaction({ initialBalance, transactions: mockedTransactions })

    expect(result).toStrictEqual([
        { date: "2024-07-06", amount: 20, previousBalance: 100, currentBalance: 120 },
        { date: "2024-07-03", amount: -100, previousBalance: 120, currentBalance: 20 },
        { date: "2024-07-01", amount: 10, previousBalance: 20, currentBalance: 30 },
        { date: "2024-06-28", amount: -50, previousBalance: 30, currentBalance: -20 },
        { date: "2024-06-26", amount: -10, previousBalance: -20, currentBalance: -30 },
        { date: "2024-06-24", amount: 40, previousBalance: -30, currentBalance: 10 },
        { date: "2024-06-22", amount: 15, previousBalance: 10, currentBalance: 25 },
      ]);
  });
});

describe('fn: calculateTimesAccountPositiveBalance', () => {
  test('Calculate times positive for an empty transactions list', () => {
    const mockedConsolidation = []

    const result = calculateTimesAccountPositiveBalance({ consolidation: mockedConsolidation })

    expect(result).toBe(0);
  });

  test('Calculate times positive when all currentBalance was positive', () => {
    const mockedConsolidation = [
      { date: "2024-07-06", amount: 75, previousBalance: 100, currentBalance: 175 },
      { date: "2024-07-03", amount: -50, previousBalance: 175, currentBalance: 125 },
      { date: "2024-07-01", amount: 100, previousBalance: 125, currentBalance: 225 },
    ]

    const result = calculateTimesAccountPositiveBalance({ consolidation: mockedConsolidation })

    expect(result).toBe(3);
  });

  test('Calculate times positive when all currentBalance was negative', () => {
    const mockedConsolidation = [
      { date: "2024-07-06", amount: -150, previousBalance: 100, currentBalance: -50 },
      { date: "2024-07-03", amount: 20, previousBalance: -50, currentBalance: -30 },
      { date: "2024-07-01", amount: 10, previousBalance: -30, currentBalance: -20 },
    ]

    const result = calculateTimesAccountPositiveBalance({ consolidation: mockedConsolidation })

    expect(result).toBe(0);
  });

  test('Calculate times positive when the list have positive and negative balances', () => {
    const mockedConsolidation = [
      { date: "2024-07-06", amount: 20, previousBalance: 100, currentBalance: 120 },
      { date: "2024-07-03", amount: -100, previousBalance: 120, currentBalance: 20 },
      { date: "2024-07-01", amount: 10, previousBalance: 20, currentBalance: 30 },
      { date: "2024-06-28", amount: -50, previousBalance: 30, currentBalance: -20 },
      { date: "2024-06-26", amount: -10, previousBalance: -20, currentBalance: -30 },
      { date: "2024-06-24", amount: 40, previousBalance: -30, currentBalance: 10 },
      { date: "2024-06-22", amount: 15, previousBalance: 10, currentBalance: 25 },
    ]

    const result = calculateTimesAccountPositiveBalance({ consolidation: mockedConsolidation })

    expect(result).toBe(5);
  });
})