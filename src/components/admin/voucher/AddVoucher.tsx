import React, { useEffect, useState } from "react";
import { Form, Input, message, InputNumber, DatePicker, Switch } from "antd";
import { useNavigate } from "react-router-dom";
import { IVoucher } from "../../../interface/voucher";
import { addVoucher, getAllVouchers } from "../../../service/voucher";

type Props = {};

const AddVoucher = (props: Props) => {
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [messageApi] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Lấy tất cả phiếu giảm giá
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllVouchers();
        setVouchers(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  // Thông báobáo
  const successMessage = () => {
    messageApi.open({
      type: "success",
      content: "Đã thêm phiếu giảm giá thành công",
    });
  };

  // Handle form bieu mau (submission)
  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        expirationDate: values.expirationDate.toISOString(), // Format date for API
      };

      // Check ma trung lap
      const isExist = vouchers.find(
        (voucher) => voucher.code === payload.code.trim()
      );
      if (isExist) {
        message.error("Mã giảm giá đã tồn tại");
        return;
      }

      const voucher = await addVoucher(payload);

      if (voucher) {
        successMessage();
        message.success("Đã thêm phiếu giảm giá thành công!");
        form.resetFields();
        navigate("/admin/Vouchers"); // Navigate phieu giam gia list
      } else {
        message.error("Không thể thêm phiếu giảm giá");
      }
    } catch (error) {
      console.error("Lỗi khi thêm phiếu giảm giá: ", error);
      message.error("Server error: Không thể thêm phiếu giảm giá.");
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto p-8 bg-white shadow-xl rounded-xl">
        <Form form={form} onFinish={onFinish}>
          <div>
            <label className="mb-2 text-2xl text-black block">
              Mã Voucher:
            </label>
            <Form.Item
              name="code"
              rules={[{ required: true, message: "Vui lòng nhập mã code!" }]}
            >
              <Input
                className="text-gray-700 p-4 w-full rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Vui lòng nhập mã code!"
              />
            </Form.Item>
          </div>

          <div>
            <label className="mb-2 text-2xl text-black block">Giá giảm:</label>
            <Form.Item
              name="discountAmount"
              rules={[{ required: true, message: "Vui lòng nhập giá giảm!" }]}
            >
              <InputNumber
                className="text-gray-700 w-full py-3 text-lg px-6 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Vui lòng nhập giá giảm!"
                min={0}
                formatter={(value) => ` ${value}`} // Tùy chọn: Định dạng giá trị thành tiền tệ
              />
            </Form.Item>
          </div>

          <div>
            <label className="mb-2 text-2xl text-black block">
              Ngày hết hạn:
            </label>
            <Form.Item
              name="expirationDate"
              rules={[{ required: true, message: "Ngày hết hạn!" }]}
            >
              <DatePicker
                className="w-full text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Ngày hết hạn!"
                format="YYYY-MM-DD" // Tùy chọn: Chỉ định định dạng ngày
              />
            </Form.Item>
          </div>

          <div>
            <label className="mb-2 text-2xl text-black block">Số lượng:</label>
            <Form.Item
              name="quantity"
              rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
            >
              <InputNumber
                className="text-gray-700 w-full py-3 text-lg px-6 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Vui lòng nhập số lượng!"
                min={1}
              />
            </Form.Item>
          </div>

          <div>
            <label className="mb-2 text-2xl text-black block">Hiệu lực:</label>
            <Form.Item
              name="isActive"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </div>

          <button
            type="submit"
            className="!mt-8 w-full px-4 py-2.5 mx-auto block text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thêm mới voucher
          </button>
        </Form>
      </div>
    </>
  );
};

export default AddVoucher;
