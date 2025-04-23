import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Icategory } from "../interface/category";
import { getAllCategories } from "../service/category";
import logo from "./img/logo2.png";
import nguoi from "../anh/user.png";
import iconarrow from "./icons/down-arrow_5082780.png";
import axios from "axios";
import { getCartByID } from "../service/cart"; // ✅ Thêm dòng này
import { Icart } from "../interface/cart"; // ✅ Thêm dòng này

const Header = () => {
  const [cartCount, setCartCount] = useState<number>(0); // ✅ Thêm dòng này
  const [user, setUser] = useState<{
    info: { role: string; name: string; email: string; id: string };
    id: string;
  } | null>(null);
  const [categories, setCategories] = useState<Icategory[]>([]);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [profileData, setProfileData] = useState({ img: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserProfile(parsedUser.id);
      fetchCartCount(parsedUser.id); // ✅ Thêm dòng này
    }

    const fetchCategories = async () => {
      const data = await getAllCategories();
      setCategories(data);
    };

    fetchCategories();
  }, []);

  const fetchUserProfile = async (id: string) => {
    try {
      const response = await axios.get(`http://localhost:28017/user/${id}`);
      if (response.data) {
        setProfileData({
          img: response.data.img || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  // ✅ Thêm hàm lấy tổng số lượng sản phẩm trong giỏ hàng
  const fetchCartCount = async (userId: string) => {
    try {
      const cart: Icart = await getCartByID(userId);
      if (cart && cart.items) {
        const total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(total);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      navigate(`/search/${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        {/* Dòng trên cùng chứa thông tin liên hệ */}
        <div className="bg-gray-50 text-gray-700 text-sm py-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end items-center space-x-6">
            <div className="flex items-center">
              <span className="w-px h-5 bg-gray-300 mr-3"></span>
              <p className="text-gray-700 text-sm hover:text-gray-900 transition-colors duration-200">
                Số điện thoại: 0344357227
              </p>
            </div>
            <div className="flex items-center">
              <span className="w-px h-5 bg-gray-300 mr-3"></span>
              <p className="text-gray-700 text-sm hover:text-gray-900 transition-colors duration-200">
                Email: support@clickmobile.vn
              </p>
            </div>
          </div>
        </div>

        {/* Dòng thứ 2: Header chính */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo + Navigation */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <span
                  className="text-black italic"
                  style={{
                    fontSize: "30px",
                    fontFamily: '"Brush Script MT", cursive',
                  }}
                >
                  Click Mobile
                </span>
                <img
                  src={logo}
                  alt="Logo"
                  className="h-12 transition-transform duration-300 hover:scale-105"
                />
              </Link>

              <nav className="hidden lg:flex space-x-6">
                {["/", "/products", "/tintuc", "/gioithieu"].map(
                  (path, index) => {
                    const labels = [
                      "Trang chủ",
                      "Sản phẩm",
                      "Tin tức",
                      "Giới thiệu",
                    ];
                    return (
                      <NavLink
                        key={index}
                        to={path}
                        className={({ isActive }) =>
                          `text-sm font-medium uppercase tracking-wide transition-all duration-200 ${
                            isActive
                              ? "text-black"
                              : "text-gray-600 hover:text-black"
                          }`
                        }
                      >
                        {labels[index]}
                      </NavLink>
                    );
                  }
                )}
              </nav>
            </div>

            {/* Thanh công cụ bên phải */}
            <div className="flex items-center space-x-6">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  className="w-64 pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchClick()}
                />
                <svg
                  className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Dropdown người dùng */}
              {user ? (
                <div className="relative group">
                  <div className="flex items-center cursor-pointer border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100 transition-colors duration-200">
                    <img
                      src={profileData.img || nguoi}
                      alt="user"
                      className="w-8 h-8 rounded-full object-cover border"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src = nguoi)
                      }
                    />
                    <span className="ml-2 font-medium">{user.info.name}</span>
                    <img src={iconarrow} alt="▼" className="w-4 h-4 ml-1" />
                  </div>

                  <div className="absolute right-0 mt-2 bg-white shadow-md border rounded-md w-52 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <Link
                      to={`/profileinfo/${user.id}`}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Cá nhân
                    </Link>
                    {(user.info.role === "admin" ||
                      user.info.role === "shipper") && (
                      <Link
                        to={user.info.role === "admin" ? "/admin" : "/shipper"}
                        className="block px-4 py-2 hover:bg-gray-100"
                      >
                        Quản trị
                      </Link>
                    )}
                    <Link
                      to={`/Cart/${user.id}`}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Giỏ hàng
                    </Link>
                    <Link
                      to="/donhang"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Đơn hàng
                    </Link>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-medium text-gray-700 hover:text-black"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium text-gray-700 hover:text-black"
                  >
                    Đăng ký
                  </Link>
                </>
              )}

              {/* Giỏ hàng */}
              <Link
                to={user ? `/Cart/${user.id}` : "/login"}
                className="relative"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-gray-700 hover:text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.2 6h11.4L17 13M6 19a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4z"
                  />
                </svg>

                {/* ✅ Thêm hiển thị số lượng sản phẩm */}
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[90px]"></div>
    </>
  );
};

export default Header;
