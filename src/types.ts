export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'เงินสด' | 'โอนเงิน / PromptPay' | 'บัตรเครดิต/เดบิต' | 'อื่นๆ';

export interface Transaction {
  id: string;
  userId: string;
  userEmail?: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  year: number;
  note?: string;
  paymentMethod?: PaymentMethod | string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBudget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  budgetAmount: number;
  updatedAt: string;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgColor: string;
}

export interface MonthSummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  savingsRate: number;
}
