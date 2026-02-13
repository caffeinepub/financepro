import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export type InvestmentSubcategory = {
    __kind__: "fd";
    fd: null;
} | {
    __kind__: "etf";
    etf: null;
} | {
    __kind__: "nps";
    nps: null;
} | {
    __kind__: "stocks";
    stocks: null;
} | {
    __kind__: "other";
    other: string;
} | {
    __kind__: "gold";
    gold: null;
} | {
    __kind__: "mutualFund";
    mutualFund: null;
} | {
    __kind__: "providentFund";
    providentFund: null;
} | {
    __kind__: "crypto";
    crypto: null;
} | {
    __kind__: "governmentBond";
    governmentBond: null;
};
export interface Investment {
    id: bigint;
    subcategory: InvestmentSubcategory;
    user: Principal;
    createdDate: Time;
    currentValue: number;
    category: InvestmentCategory;
    investedAmount: number;
    dateOfInvestment: Time;
}
export interface FinancialDashboard {
    goalsAnalytics: GoalsAnalytics;
    investmentsAnalytics: InvestmentsAnalytics;
}
export interface InvestmentSummary {
    pnlPercentage: number;
    totalInvested: number;
    currentPortfolioValue: number;
    gainLossAbsolute: number;
}
export interface GoalCategoryBreakdown {
    midTermGoals: Array<GoalProgressSummary>;
    longTermGoals: Array<GoalProgressSummary>;
    shortTermGoals: Array<GoalProgressSummary>;
}
export interface GoalsAnalytics {
    categoryBreakdown: GoalCategoryBreakdown;
    totalAmountLinked: number;
    overallProgress: number;
    allGoals: Array<GoalProgressSummary>;
    totalGoalAmount: number;
}
export interface FinancialGoal {
    id: bigint;
    name: string;
    user: Principal;
    createdDate: Time;
    targetAmount: number;
    targetDate: Time;
    category: GoalCategory;
}
export interface GoalProgressSummary {
    progressPercentage: number;
    goalName: string;
    goalId: bigint;
    targetAmount: number;
    targetDate: Time;
    category: GoalCategory;
    currentAmount: number;
}
export interface UserProfile {
    name: string;
}
export interface InvestmentsAnalytics {
    allInvestments: Array<Investment>;
    summary: InvestmentSummary;
}
export enum GoalCategory {
    midTerm = "midTerm",
    shortTerm = "shortTerm",
    longTerm = "longTerm"
}
export enum InvestmentCategory {
    fixedDeposits = "fixedDeposits",
    commodities = "commodities",
    realEstate = "realEstate",
    equities = "equities",
    bonds = "bonds",
    retirement = "retirement"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFinancialGoal(name: string, targetAmount: number, targetDate: Time, category: GoalCategory): Promise<bigint>;
    addInvestment(category: InvestmentCategory, subcategory: InvestmentSubcategory, investedAmount: number, currentValue: number, dateOfInvestment: Time): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteFinancialGoal(goalId: bigint): Promise<void>;
    deleteInvestment(investmentId: bigint): Promise<void>;
    ensureInitialized(): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboard(): Promise<FinancialDashboard>;
    getFinancialGoal(goalId: bigint): Promise<FinancialGoal>;
    getGoalAnalytics(): Promise<GoalsAnalytics>;
    getInvestment(investmentId: bigint): Promise<Investment>;
    getInvestmentAnalytics(): Promise<InvestmentsAnalytics>;
    getUserFinancialGoals(): Promise<Array<FinancialGoal>>;
    getUserInvestments(): Promise<Array<Investment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    linkInvestmentToGoal(goalId: bigint, investmentId: bigint, amountAllocated: number): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unlinkInvestmentFromGoal(goalId: bigint, investmentId: bigint): Promise<void>;
    updateFinancialGoal(goalId: bigint, name: string, targetAmount: number, targetDate: Time, category: GoalCategory): Promise<void>;
    updateInvestment(investmentId: bigint, category: InvestmentCategory, subcategory: InvestmentSubcategory, investedAmount: number, currentValue: number, dateOfInvestment: Time): Promise<void>;
}
