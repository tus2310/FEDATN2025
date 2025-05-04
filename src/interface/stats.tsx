export interface Stats {
  orders: {
    totalOrders: number;
    pendingOrders: number;
    packagingOrders: number;
    completedOrders: number;
    canceledOrders: number;
  };
  products: {
    totalProducts: number;
    activeProducts: number;
    totalVariants: number;
    totalStock: number;
  };
  revenue: {
    totalRevenue: number;
    averageOrderValue: number;
  };
  timeline?: {
    date: string; // e.g., "2025-05-01"
    totalOrders: number;
    totalRevenue: number;
  }[]; // Array of timeline data
}