import { axiosservice } from "../config/API";
import { IcategoryLite } from "../interface/category";

export const getAllCategories = async (status?: string) => {
  try {
    // Construct the URL with optional status query parameter
    const url = status ? `/category?status=${status}` : "/category";
    const { data } = await axiosservice.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getCategoryByID = async (id?: string) => {
  try {
    const { data } = await axiosservice.get(`/category/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    throw error;
  }
};

export const addCategory = async (category: IcategoryLite) => {
  try {
    const { data } = await axiosservice.post("addcategory", category);
    return data;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

export const updateCategory = async (id?: string, category?: IcategoryLite) => {
  try {
    const { data } = await axiosservice.put(`/updatecategory/${id}`, category);
    return data;
  } catch (error: any) {
    console.error(
      "Error updating category:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deactivateCategory = async (id: string) => {
  try {
    const { data } = await axiosservice.put(`/category/deactivate/${id}`);
    return data;
  } catch (error) {
    console.error("Error deactivating category:", error);
    throw error;
  }
};

export const activateCategory = async (id: string) => {
  try {
    const { data } = await axiosservice.put(`/category/activate/${id}`);
    return data;
  } catch (error) {
    console.error("Error activating category:", error);
    throw error;
  }
};
