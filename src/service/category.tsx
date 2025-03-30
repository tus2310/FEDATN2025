import { axiosservice } from "../config/API";
import { IcategoryLite } from "../interface/category";

export const getAllCategories = async () => {
  try {
    const { data } = await axiosservice.get("category");
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const getCategoryByID = async (id?: string) => {
  try {
    const { data } = await axiosservice.get(`/category/${id}`);
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const addCategory = async (category: IcategoryLite) => {
  try {
    const { data } = await axiosservice.post("addcategory", category);
    return data;
  } catch (error) {
    console.log(error);
  }
};
