export interface StatValue {
    value: number | string;
    trend: string | null;
    trendUp: boolean;
    sparklineData: { value: number }[];
}

export interface DashboardStats {
    totalArticles: StatValue;
    publishedArticles: StatValue;
    pendingArticles: StatValue;
    activeUsers: StatValue;
    totalUsers: StatValue;
    mostActiveCategory: StatValue;
    premiumSubscribers: StatValue;
    freeUsers: StatValue;
}

export interface DashboardState {
    stats: DashboardStats | null;
    loading: boolean;
    error: string | null;
}
