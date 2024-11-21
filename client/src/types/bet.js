/**
 * @typedef {'open' | 'in_progress' | 'resolved' | 'claimed'} BetStatus
 * @typedef {'sports' | 'dice' | 'cards'} GameType
 * @typedef {'win' | 'lose' | 'draw' | null} BetResult
 */

/**
 * @typedef {Object} Participant
 * @property {string} address
 * @property {string} amount
 * @property {number} timestamp
 */

/**
 * @typedef {Object} Bet
 * @property {string} id
 * @property {GameType} gameType
 * @property {string} wagerAmount
 * @property {string} poolLimit
 * @property {string} description
 * @property {string} banker
 * @property {string} currentPool
 * @property {string} remainingPool
 * @property {Participant[]} players
 * @property {Participant[]} contributors
 * @property {BetStatus} status
 * @property {BetResult} [result]
 * @property {number} createdAt
 * @property {number} [resolvedAt]
 */

/**
 * @typedef {Object} SmartContractBet
 * @property {string} betId
 * @property {number} gameType
 * @property {bigint} wagerAmount
 * @property {bigint} poolLimit
 * @property {string} description
 * @property {string} banker
 * @property {bigint} currentPool
 * @property {bigint} remainingPool
 * @property {number} status
 * @property {number} [result]
 */