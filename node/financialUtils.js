/**
 * @typedef ConsolidationItem
 * @type {object}
 * @property {string} date
 * @property {number} amount
 * @property {number} previousBalance - the balance before the transaction
 * @property {number} currentBalance - the balance after the transaction
 */

/**
 * Responsible for consolidating the transactions and get the history of the account balance.
 * @param {Object} params
 * @param {number} params.initialBalance
 * @param {Array} params.transactions
 * @returns {Array<ConsolidationItem>}
 */
const consolidateTransaction = ({ initialBalance, transactions }) => {
  // The transactions need to be sorted from the most recent to the oldest.
  // Since it will recreate the historical balance;
  const compareTxnsByDateAscending = (a, b) => (a.date < b.date) - (a.date > b.date);
  const sortingTransactions = [...transactions].sort(compareTxnsByDateAscending);

  const { consolidation } = sortingTransactions.reduce((result, transaction) => {
    let currentBalance = result.balance

    if (transaction.amount > 0) {
      // We need to sum to the balance, because positive values means money moves out of the account;
      currentBalance += Math.abs(transaction.amount);
    } else {
      // We need to subtract to the balance, because negative values means money moves into the account;
      currentBalance -= Math.abs(transaction.amount);
    }

    const consolidation = {
      date: transaction.date,
      amount: transaction.amount, 
      previousBalance: result.balance, 
      currentBalance,
    }

    return {
      balance: currentBalance, 
      consolidation: [...result.consolidation, consolidation]
    };

  }, { balance: initialBalance, consolidation: [] })

  return consolidation
}

/**
 * Resposible to go through the consolidation list and check how many times the current balance was positive.
 * @param {Object} params
 * @param {Array<ConsolidationItem>} params.consolidation
 * @returns {number}
 */
const calculateTimesAccountPositiveBalance = ({ consolidation }) => {
  return consolidation.reduce((result, transaction) => {
    const { currentBalance } = transaction;

    if (currentBalance > 0) {
      return result + 1;
    }

    return result;
  }, 0)
}

/**
 * Calculate the fiscal responsibility score based on the transactions history.
 * @param {Object} params
 * @param {number} params.initialBalance
 * @param {Array} params.transactions
 * @returns {number} - Percentage of how many time the balance was positive during the transactions.
 */
const calculateFiscalResposibilityScore = ({ initialBalance, transactions }) => {
  const consolidation = consolidateTransaction({ initialBalance, transactions });
  const timesPositive = calculateTimesAccountPositiveBalance({ consolidation });

  const score = (100 * timesPositive) / transactions.length

  return Number(new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2
  }).format(score))
}

module.exports = {
  consolidateTransaction,
  calculateTimesAccountPositiveBalance,
  calculateFiscalResposibilityScore,
}