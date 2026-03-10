export const statsData = [
  {
    id: 'total-balance',
    title: 'Total Balance',
    value: '$24,580.00',
    trend: '+12.5% from last month',
    trendUp: true,
    icon: 'wallet',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    id: 'outstanding-debt',
    title: 'Outstanding Debt',
    value: '$8,450.00',
    trend: '+5.2% from last month',
    trendUp: true,
    icon: 'alert-triangle',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
  },
  {
    id: 'overdue-count',
    title: 'Overdue Count',
    value: '12',
    trend: '3 critical',
    trendUp: false,
    icon: 'clock',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
  },
  {
    id: 'monthly-profit',
    title: 'Monthly Profit',
    value: '$3,240.00',
    trend: '+8.1% from last month',
    trendUp: true,
    icon: 'trending-up',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
  },
]

export const portfolioData = [
  { name: 'Investments', value: 45, color: '#3b82f6' },
  { name: 'Cash', value: 25, color: '#1e3a5f' },
  { name: 'Debts', value: 20, color: '#ef4444' },
  { name: 'Assets', value: 10, color: '#22c55e' },
]

export const monthlyTrendsData = [
  { month: 'Jan', balance: 18000, debts: 9000 },
  { month: 'Feb', balance: 19500, debts: 8800 },
  { month: 'Mar', balance: 20000, debts: 9200 },
  { month: 'Apr', balance: 21500, debts: 8500 },
  { month: 'May', balance: 23000, debts: 8200 },
  { month: 'Jun', balance: 24580, debts: 8450 },
]

export type DebtorStatus = 'Overdue' | 'Pending' | 'Paid'

export interface Debtor {
  id: number
  date: string
  name: string
  avatar: string
  amount: string
  status: DebtorStatus
}

export const debtorsData: Debtor[] = [
  { id: 1, date: '2024-03-15', name: 'John Smith',    avatar: 'JS', amount: '$2,500.00', status: 'Overdue' },
  { id: 2, date: '2024-03-12', name: 'Sarah Johnson', avatar: 'SJ', amount: '$1,850.00', status: 'Pending' },
  { id: 3, date: '2024-03-10', name: 'Michael Brown', avatar: 'MB', amount: '$3,200.00', status: 'Paid'    },
  { id: 4, date: '2024-03-08', name: 'Emma Wilson',   avatar: 'EW', amount: '$900.00',   status: 'Pending' },
]

// ── Balances ────────────────────────────────────────────────

export const portfolioChartData = [
  { time: '6h ago', value: 18200 },
  { time: '5h ago', value: 19100 },
  { time: '4h ago', value: 20400 },
  { time: '3h ago', value: 21000 },
  { time: '2h ago', value: 22300 },
  { time: '1h ago', value: 23800 },
  { time: 'Now',    value: 24580 },
]

export const currenciesData = [
  { id: 'usd', symbol: '$',  code: 'USD', name: 'US Dollar',  change: '+2.1%', changeUp: true,  value: '$18,450.00',  sub: 'Available: $14,290.00', color: 'bg-green-100',  textColor: 'text-green-700'  },
  { id: 'eur', symbol: '€',  code: 'EUR', name: 'Euro',       change: '-0.8%', changeUp: false, value: '€2,840.00',   sub: 'Available: €2,840.00',  color: 'bg-blue-100',   textColor: 'text-blue-700'   },
  { id: 'btc', symbol: '₿',  code: 'BTC', name: 'Bitcoin',    change: '+8.4%', changeUp: true,  value: '0.1248 BTC',  sub: '≈$2,890.00',            color: 'bg-orange-100', textColor: 'text-orange-700' },
  { id: 'eth', symbol: 'Ξ',  code: 'ETH', name: 'Ethereum',   change: '+3.7%', changeUp: true,  value: '1.85 ETH',    sub: '≈$400.00',              color: 'bg-purple-100', textColor: 'text-purple-700' },
]

export interface AccountRow {
  id: number
  account: string
  icon: string
  iconBg: string
  currency: string
  available: string
  locked: string
  total: string
}

export const accountsData: AccountRow[] = [
  { id: 1, account: 'Trading Account',    icon: '📈', iconBg: 'bg-blue-100',   currency: 'USD', available: '$8,450.00',   locked: '$2,100.00',    total: '$10,550.00'  },
  { id: 2, account: 'Savings Account',    icon: '💰', iconBg: 'bg-green-100',  currency: 'USD', available: '$5,840.00',   locked: '$0.00',        total: '$5,840.00'   },
  { id: 3, account: 'Crypto Wallet',      icon: '🔐', iconBg: 'bg-orange-100', currency: 'BTC', available: '0.1048 BTC',  locked: '0.0200 BTC',   total: '0.1248 BTC'  },
  { id: 4, account: 'Investment Account', icon: '📊', iconBg: 'bg-purple-100', currency: 'EUR', available: '€2,840.00',   locked: '€0.00',        total: '€2,840.00'   },
]

export type ChangeType = 'deposit' | 'withdrawal' | 'transfer'

export interface RecentChange {
  id: number
  type: ChangeType
  title: string
  subtitle: string
  amount: string
  currency: string
  amountUp: boolean
}

export const recentChangesData: RecentChange[] = [
  { id: 1, type: 'deposit',    title: 'Deposit',    subtitle: 'Trading Account • 2 hours ago', amount: '+$1,500.00',  currency: 'USD',     amountUp: true  },
  { id: 2, type: 'withdrawal', title: 'Withdrawal', subtitle: 'Savings Account • 1 day ago',   amount: '-$800.00',    currency: 'USD',     amountUp: false },
  { id: 3, type: 'transfer',   title: 'Transfer',   subtitle: 'Crypto Purchase • 2 days ago',  amount: '+0.0248 BTC', currency: 'Bitcoin', amountUp: true  },
]

// ── Trade ────────────────────────────────────────────────────

export const marketTabs = [
  { id: 'btc-usd', label: 'BTC/USD' },
  { id: 'eth-usd', label: 'ETH/USD' },
  { id: 'eur-usd', label: 'EUR/USD' },
]

export const priceChartData: Record<string, { day: string; value: number }[]> = {
  '1D': [
    { day: 'Mon', value: 41200 },
    { day: 'Tue', value: 42100 },
    { day: 'Wed', value: 41800 },
    { day: 'Thu', value: 43000 },
    { day: 'Fri', value: 42500 },
    { day: 'Sat', value: 43200 },
    { day: 'Sun', value: 43582 },
  ],
  '1H': [
    { day: '10:00', value: 43100 },
    { day: '10:10', value: 43250 },
    { day: '10:20', value: 43180 },
    { day: '10:30', value: 43400 },
    { day: '10:40', value: 43320 },
    { day: '10:50', value: 43500 },
    { day: '11:00', value: 43582 },
  ],
  '4H': [
    { day: '08:00', value: 42800 },
    { day: '09:00', value: 43000 },
    { day: '10:00', value: 42900 },
    { day: '11:00', value: 43300 },
    { day: '12:00', value: 43582 },
  ],
  '1W': [
    { day: 'Wk1', value: 40000 },
    { day: 'Wk2', value: 41500 },
    { day: 'Wk3', value: 42000 },
    { day: 'Wk4', value: 43582 },
  ],
  '1M': [
    { day: 'Jan', value: 38000 },
    { day: 'Feb', value: 40000 },
    { day: 'Mar', value: 43582 },
  ],
}

export type OrderSide = 'Buy' | 'Sell'

export interface OpenOrder {
  id: number
  pair: string
  type: string
  side: OrderSide
  price: string
  amount: string
  filled: string
}

export const openOrdersData: OpenOrder[] = [
  { id: 1, pair: 'BTC/USD', type: 'Limit', side: 'Buy',  price: '$42,500.00', amount: '0.05 BTC', filled: '0%'  },
  { id: 2, pair: 'ETH/USD', type: 'Limit', side: 'Sell', price: '$2,280.00',  amount: '0.85 ETH', filled: '45%' },
]

export type PositionSide = 'Long' | 'Short'

export interface OpenPosition {
  id: number
  pair: string
  side: PositionSide
  entryPrice: string
  currentPrice: string
  amount: string
  pnl: string
  pnlUp: boolean
}

export const openPositionsData: OpenPosition[] = [
  { id: 1, pair: 'BTC/USD', side: 'Long', entryPrice: '$41,200.00', currentPrice: '$43,582.50', amount: '0.12 BTC', pnl: '+$285.90', pnlUp: true },
]
