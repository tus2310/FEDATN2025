import React from "react";
import { axiosservice } from "../config/API";
import { IVariant, IProductLite } from "../interface/products";
import axios from "axios";

interface ProductQueryParams {
  limit: number;
  page: number;
  category?: string;
  admin?: string;
}

export const getAllproducts = async (params: ProductQueryParams) => {
  try {
    const { limit, page, category, admin } = params;
    let url = `/product-test?limit=${limit}&page=${page}`;
    
    if (category) {
      url += `&category=${category}`;
    }
    
    // Apply active category/product filters unless admin is true
    if (admin !== "true") {
      url += `&categoryStatus=active&status=true`;
    }

    const { data } = await axiosservice.get(url);
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProductByID = async (id?: string) => {
  try {
    const { data } = await axiosservice.get(`/product/${id}`);
    return data;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

export const addProduct = async (payload: any) => {
  try {
    const response = await axios.post(
      "http://localhost:28017/product/add",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const updateProduct = async (id?: string, product?: IProductLite) => {
  try {
    const { createdAt, updatedAt, ...productData } = product || {};
    const { data } = await axiosservice.put(`product/${id}`, product);
    return data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const DeleteProduct = async (pid: string) => {
  try {
    const { data } = await axiosservice.delete(`/product/${pid}`);
    return data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Hàm kích hoạt sản phẩm
export const ActivateProduct = async (pid: string) => {
  try {
    const { data } = await axiosservice.put(`/product/activate/${pid}`);
    return data;
  } catch (error) {
    console.error("Error activating product:", error);
    throw error;
  }
};

// Hàm vô hiệu hóa sản phẩm
export const DeactivateProduct = async (pid: string) => {
  try {
    const { data } = await axiosservice.put(`/product/deactivate/${pid}`);
    return data;
  } catch (error) {
    console.error("Error deactivating product:", error);
    throw error;
  }
};

// Hàm lọc sản phẩm theo danh mục
export const getProductsByCategory = async (categoryId: string) => {
  try {
    const { data } = await axiosservice.get(`/products/category/${categoryId}`);
    return data;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
};

export const calculateTotalQuantity = (variants?: IVariant[]): number => {
  if (!variants || variants.length === 0) return 0;
  return variants.reduce((total, variant) => {
    const subVariantTotal = variant.subVariants.reduce(
      (subTotal, subVariant) => subTotal + subVariant.quantity,
      0
    );
    return total + subVariantTotal;
  }, 0);
};

// service/products.ts
export const checkProductExistence = async (masp: string, name: string) => {
  try {
    const response = await fetch(
      `/api/products/check-existence?masp=${masp}&name=${name}`
    );
    const data = await response.json();
    return data; // Trả về true nếu tồn tại, false nếu không tồn tại
  } catch (error) {
    console.error("Error checking product existence:", error);
    return { exists: false }; // Mặc định là không tồn tại
  }
};