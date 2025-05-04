import { axiosservice } from '../config/API';
import { Stats } from '../interface/stats';

export const getStats = async (): Promise<Stats> => {
  try {
    const response = await axiosservice.get("/api/stats"); // Adjust endpoint if needed
    console.log("Fetched stats:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    throw new Error(
      error.response?.data?.message || "Could not fetch statistics. Please try again later."
    );
  }
};