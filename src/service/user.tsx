import React from "react";
import { axiosservice } from "../config/API";
import { IUserLogin, IUserRegister, IUserLite } from "../interface/user";
import axios from "axios";

export const getAllusersAccount = async () => {
  try {
    const { data } = await axiosservice.get("usersaccount");

    // console.log('getAllusers', data);

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const UserLogin = async (datauser: IUserLogin) => {
  try {
    const { data } = await axiosservice.post("/login", datauser);

    // Kiểm tra dữ liệu trả về từ server
    if (data && data.isActive === false) {
      throw new Error("Account is deactivated");
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    // Nếu có lỗi do server trả về
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || "An error occurred";
      throw new Error(message); // Trả lại thông báo lỗi từ server
    }
    throw error; // Trả lại lỗi khác
  }
};

export const UserRegister = async (datauser: IUserRegister) => {
  try {
    const { data } = await axiosservice.post("/register", datauser);
    return data;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};

export const updateUser = async (_id: string, newRole: string) => {
  try {
    const response = await axiosservice.put(`/admin/user/${_id}`, { role: newRole });
    return response.data; // Ensure this returns the updated user data
  } catch (error) {
    // console.error("Error updating user in API:", error);
    throw error; // Rethrow to handle in the calling function
  }
};

export const getUserById = async (_id?: string) => {
  try {
    const { data } = await axiosservice.get(`/user/${_id}`);
    // console.log(_id);
    return data;
  } catch (error) {
    console.log(error);
  }
};
