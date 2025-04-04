import React, { useEffect, useState } from "react";
import { getStats } from "../../service/stats";
import { Stats } from "../../interface/stats";
import { Card, Col, Row, Statistic, Spin } from "antd";
import { DollarOutlined, ShoppingCartOutlined, ProductOutlined } from "@ant-design/icons";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Thongke = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getStats();
        console.log("Frontend Stats:", data);
        setStats(data);
      } catch (err) {
        setError("Failed to load statistics.");
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  } 
  if (error) {
    return <div style={{ color: "red", textAlign: "center" }}>{error}</div>;
  }  


  // Order Statistics Bar Chart Data
  const orderChartData = {
    labels: ["Tổng đơn hàng", "Đang chờ", "Đang đóng gói", "Hoàn thành", "Đã hủy"],
    datasets: [
      {
        label: "Số lượng đơn hàng",
        data: [
          stats?.orders.totalOrders || 0,
          stats?.orders.pendingOrders || 0,
          stats?.orders.packagingOrders || 0,
          stats?.orders.completedOrders || 0,
          stats?.orders.canceledOrders || 0,
        ],
        backgroundColor: [
          "#1890ff", // Blue for total
          "#faad14", // Yellow for pending
          "#722ed1", // Purple for packaging
          "#52c41a", // Green for completed
          "#f5222d", // Red for canceled
        ],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };


  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "24px" }}>Thống kê tổng quan</h1>

      {/* Numeric Statistics */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats?.products.totalProducts}
              prefix={<ProductOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sản phẩm hoạt động"
              value={stats?.products.activeProducts}
              prefix={<ProductOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng biến thể"
              value={stats?.products.totalVariants}
              prefix={<ProductOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng kho"
              value={stats?.products.totalStock}
              prefix={<ProductOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={stats?.orders.totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng đang chờ"
              value={stats?.orders.pendingOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng đang đóng gói"
              value={stats?.orders.packagingOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng hoàn thành"
              value={stats?.orders.completedOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đơn hàng đã hủy"
              value={stats?.orders.canceledOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={12}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats?.revenue.totalRevenue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic
              title="Giá trị đơn hàng trung bình"
              value={stats?.revenue.averageOrderValue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={12}>
          <Card title="Biểu đồ đơn hàng">
            <Bar data={orderChartData} options={orderChartOptions} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Biểu đồ sản phẩm">
            <Pie data={productChartData} options={productChartOptions} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={12}>
          <Card title="Biểu đồ doanh thu">
            <Bar data={revenueChartData} options={revenueChartOptions} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Thongke;