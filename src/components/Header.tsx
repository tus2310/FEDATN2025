import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Icategory } from "../interface/category";
import { getAllCategories } from "../service/category";
import { getProductsByCategory } from "../service/products";
import logo from "./img/logo.png";
import nguoi from "../anh/user.png";

import iconarrow from "./icons/down-arrow_5082780.png";
import axios from "axios";

const Header = () => {
  const [user, setUser] = useState<{
    info: { role: string; name: string; email: string; id: string };
    id: string;
  } | null>(null);
  const [categories, setCategories] = useState<Icategory[]>([]);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [productsByCategory, setProductsByCategory] = useState([]);
  const Navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [prevSelectedCategory, setPrevSelectedCategory] = useState<
    string | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    img: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      fetchUserProfile(parsedUser.id);
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
        const formattedDob = response.data.dob
          ? new Date(response.data.dob).toISOString().split("T")[0]
          : "";
        setProfileData({
          img: response.data.img || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const toggleSubMenu = () => {
    setIsSubMenuOpen(!isSubMenuOpen);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
    Navigate("/");
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      Navigate(`/search/${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleCategoryFilter = (categoryName: string) => {
    if (categoryName === selectedCategory) {
      // Thông báo khi cùng một danh mục được nhấp hai lần.
      alert(`Bạn đã chọn danh mục ${categoryName}.`);
    } else {
      setPrevSelectedCategory(selectedCategory);
      setSelectedCategory(categoryName);
      navigate(`/categories/${categoryName}`);
    }
  };

  return (
    <div className="container mx-auto w-full">
      <div className="up py-[15px] flex justify-between font-medium pr-[10px]">
        <div className="trái flex">
          <div className="flex items-center px-[20px]">
            <span className="border-black h-full mr-[10px]"></span>
            <p className="italic hover:scale-110 transition-transform duration-300">
              Số điện thoại: 0344357227
            </p>
          </div>

          <div className="flex items-center px-[20px]">
            <span className=" border-black h-full mr-[10px]"></span>
            <p className="italic hover:scale-110 transition-transform duration-300">
              Email:
            </p>
          </div>
        </div>
      </div>

      <div className="down flex justify-between border-y-2 py-[12px] border-black pr-[10px]">
        <Link
          to="/"
          className="hover:scale-110 transition-transform duration-300 uppercase inline-block"
        >
          <img className="h-24 pl-[40px]" src={logo} alt="" />
        </Link>
        <div className="right flex pl-[30px]">
          <div className="text flex gap-14 pt-[25px] pr-[100px] text-lg">
            <Link
              to="/"
              className="hover:scale-110 transition-transform duration-300 border-black hover:border-b-2 uppercase inline-block"
            >
              Trang chủ
            </Link>

            <NavLink
              to="/products"
              className="hover:scale-110 transition-transform duration-300 border-black hover:border-b-2 uppercase inline-block"
            >
              Sản phẩm
            </NavLink>

            <NavLink
              to="/tintuc"
              className="hover:scale-110 transition-transform duration-300 border-black hover:border-b-2 uppercase inline-block"
            >
              Tin tức
            </NavLink>

            <NavLink
              to="/gioithieu"
              className="hover:scale-110 transition-transform duration-300 border-black hover:border-b-2 uppercase inline-block"
            >
              Giới thiệu
            </NavLink>
          </div>

          <div className="search px-[30px] pt-[23px]">
            <div className="relative">
              <svg
                className="w-4 h-4 absolute right-[10px] top-3.5"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
