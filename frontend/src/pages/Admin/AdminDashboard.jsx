import Chart from "react-apexcharts";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
  useGetCategoryDistributionQuery,
  useGetTopProductsQuery,
  useGetMonthlyOrdersQuery,
} from "../../redux/api/orderApiSlice";
import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import OrderList from "./OrderList";
import Loader from "../../components/Loader";
import { 
  FaUsers, 
  FaChartBar, 
  FaRupeeSign, 
  FaBoxOpen, 
  FaShoppingCart,
  FaArrowUp,
  FaArrowDown,
  FaBox
} from "react-icons/fa";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data: sales, isLoading } = useGetTotalSalesQuery();
  const { data: customers, isLoading: loading } = useGetUsersQuery();
  const { data: orders, isLoading: loadingTwo } = useGetTotalOrdersQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();
  
  // Real-time data queries with default values
  const { data: categoryData = { categories: [] }, isLoading: loadingCategories } = useGetCategoryDistributionQuery();
  const { data: topProductsData = { products: [] }, isLoading: loadingProducts } = useGetTopProductsQuery();
  const { data: monthlyData = { monthlyData: Array(12).fill(0) }, isLoading: loadingMonthly } = useGetMonthlyOrdersQuery();

  // Default data for charts
  const defaultMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const defaultCategories = ['Electronics', 'Fashion', 'Home & Living', 'Books', 'Sports'];
  const defaultCategoryData = [35, 25, 20, 12, 8]; // Percentages adding up to 100%

  // Default top products data
  const defaultTopProducts = [
    { name: 'Smartphone X', sales: 85000 },
    { name: 'Laptop Pro', sales: 72000 },
    { name: 'Wireless Earbuds', sales: 58000 },
    { name: 'Smart Watch', sales: 45000 },
    { name: 'Gaming Console', sales: 38000 }
  ];

  // Default monthly orders data (showing a realistic trend)
  const defaultMonthlyOrders = [120, 145, 135, 160, 180, 175, 195, 200, 220, 215, 235, 250];

  // Calculate growth (mock data - replace with actual calculations)
  const revenueGrowth = 12.5;
  const customerGrowth = 8.3;
  const orderGrowth = 15.7;

  // Revenue Chart State
  const [revenueState, setRevenueState] = useState({
    options: {
      chart: {
        type: "area",
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false,
          },
        },
        background: "#fff",
      },
      tooltip: {
        theme: "light",
        style: {
          fontSize: '12px',
          fontFamily: 'inherit',
        },
      },
      colors: ["#3b82f6"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [50, 100, 100]
        }
      },
      title: {
        text: "Revenue Trend",
        align: "left",
        style: {
          fontSize: '16px',
          fontWeight: 600,
          color: '#111827',
        },
      },
      grid: {
        borderColor: "#e5e7eb",
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
      },
      markers: {
        size: 4,
        colors: ["#3b82f6"],
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: {
          size: 6,
        },
      },
      xaxis: {
        categories: defaultMonths,
        title: {
          text: "Date",
          style: {
            fontSize: '12px',
            fontWeight: 500,
            color: '#6b7280',
          },
        },
        labels: {
          style: {
            fontSize: '12px',
            fontFamily: 'inherit',
            color: '#6b7280',
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        title: {
          text: "Revenue (₹)",
          style: {
            fontSize: '12px',
            fontWeight: 500,
            color: '#6b7280',
          },
        },
        labels: {
          style: {
            fontSize: '12px',
            fontFamily: 'inherit',
            color: '#6b7280',
          },
          formatter: (value) => `₹${value.toLocaleString()}`,
        },
        min: 0,
      },
    },
    series: [{ name: "Revenue", data: Array(12).fill(0) }],
  });

  // Update Revenue Chart
  useEffect(() => {
    if (salesDetail) {
      const formattedSales = salesDetail.map((item) => ({
        x: new Date(item._id).toLocaleDateString(),
        y: item.totalSales,
      }));

      setRevenueState((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            ...prevState.options.xaxis,
            categories: formattedSales.map((item) => item.x),
          },
        },
        series: [
          {
            name: "Revenue",
            data: formattedSales.map((item) => item.y),
          },
        ],
      }));
    }
  }, [salesDetail]);

  // Demographics Chart (static data)
  const [demographicsState] = useState({
    options: {
      chart: {
        type: 'bar',
        background: '#fff',
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
        }
      },
      colors: ['#3b82f6'],
      xaxis: {
        categories: ['18-24', '25-34', '35-44', '45-54', '55+'],
      }
    },
    series: [{
      name: 'Users',
      data: [15, 40, 25, 15, 5]
    }]
  });

  // Product Categories Chart
  const [categoryState, setCategoryState] = useState({
    options: {
      chart: {
        type: 'donut',
        background: '#fff',
      },
      labels: defaultCategories,
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
      legend: {
        position: 'bottom',
        fontSize: '14px',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%'
          }
        },
        tooltip: {
          y: {
            formatter: (value) => `${value}% of total products`
          }
        }
      }
    },
    series: defaultCategoryData
  });

  // Update category chart when data changes
  useEffect(() => {
    if (categoryData?.categories?.length > 0) {
      setCategoryState(prev => ({
        ...prev,
        options: {
          ...prev.options,
          labels: categoryData.categories.map(cat => cat.name)
        },
        series: categoryData.categories.map(cat => cat.count)
      }));
    }
  }, [categoryData]);

  // Top Products Chart
  const [productsState, setProductsState] = useState({
    options: {
      chart: {
        type: 'bar',
        background: '#fff',
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          horizontal: true,
          barHeight: '60%',
        }
      },
      colors: ['#10b981'],
      xaxis: {
        categories: defaultTopProducts.map(product => product.name),
        labels: {
          formatter: (value) => `₹${(value/1000).toFixed(0)}k`
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      tooltip: {
        y: {
          formatter: (value) => `₹${value.toLocaleString()}`
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (value) => `₹${(value/1000).toFixed(0)}k`,
        style: {
          fontSize: '12px',
        },
        offsetX: 30
      }
    },
    series: [{
      name: 'Sales',
      data: defaultTopProducts.map(product => product.sales)
    }]
  });

  // Monthly Orders Chart
  const [ordersState, setOrdersState] = useState({
    options: {
      chart: {
        type: 'line',
        background: '#fff',
        toolbar: {
          show: false
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3,
      },
      colors: ['#8b5cf6'],
      xaxis: {
        categories: defaultMonths,
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (value) => Math.round(value),
          style: {
            fontSize: '12px'
          }
        },
        title: {
          text: 'Number of Orders',
          style: {
            fontSize: '12px',
            fontWeight: 500
          }
        }
      },
      markers: {
        size: 4,
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: {
          size: 6,
        }
      },
      tooltip: {
        y: {
          formatter: (value) => `${value} Orders`
        }
      },
      grid: {
        borderColor: '#e5e7eb',
        strokeDashArray: 4,
      }
    },
    series: [{
      name: 'Orders',
      data: defaultMonthlyOrders
    }]
  });

  // Update products chart when data changes
  useEffect(() => {
    if (topProductsData?.products?.length > 0) {
      setProductsState(prev => ({
        ...prev,
        options: {
          ...prev.options,
          xaxis: {
            ...prev.options.xaxis,
            categories: topProductsData.products.map(p => p.name)
          }
        },
        series: [{
          name: 'Sales',
          data: topProductsData.products.map(p => p.totalSales)
        }]
      }));
    }
  }, [topProductsData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-full space-y-8">
            {/* Page Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 mt-1">Welcome to your admin dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Revenue Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FaRupeeSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {isLoading ? (
                          <Loader />
                        ) : (
                          `₹${sales?.totalSales.toLocaleString() || 0}`
                        )}
                      </h3>
                    </div>
                  </div>
                  <div className={`flex items-center ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueGrowth >= 0 ? <FaArrowUp className="w-3 h-3 mr-1" /> : <FaArrowDown className="w-3 h-3 mr-1" />}
                    <span className="text-sm font-medium">{Math.abs(revenueGrowth)}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">vs. previous month</p>
              </div>

              {/* Customers Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <FaUsers className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Customers</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {loading ? <Loader /> : customers?.length.toLocaleString() || 0}
                      </h3>
                    </div>
                  </div>
                  <div className={`flex items-center ${customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {customerGrowth >= 0 ? <FaArrowUp className="w-3 h-3 mr-1" /> : <FaArrowDown className="w-3 h-3 mr-1" />}
                    <span className="text-sm font-medium">{Math.abs(customerGrowth)}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">vs. previous month</p>
              </div>

              {/* Orders Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <FaShoppingCart className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {loadingTwo ? <Loader /> : orders?.totalOrders.toLocaleString() || 0}
                      </h3>
                    </div>
                  </div>
                  <div className={`flex items-center ${orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {orderGrowth >= 0 ? <FaArrowUp className="w-3 h-3 mr-1" /> : <FaArrowDown className="w-3 h-3 mr-1" />}
                    <span className="text-sm font-medium">{Math.abs(orderGrowth)}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">vs. previous month</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                {isLoading ? (
                  <div className="flex justify-center items-center h-[350px]">
                    <Loader />
                  </div>
                ) : (
                  <Chart
                    options={revenueState.options}
                    series={revenueState.series}
                    type="area"
                    height={350}
                  />
                )}
              </div>

              {/* Product Categories Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
                {loadingCategories ? (
                  <div className="flex justify-center items-center h-[350px]">
                    <Loader />
                  </div>
                ) : (
                  <Chart
                    options={categoryState.options}
                    series={categoryState.series}
                    type="donut"
                    height={350}
                  />
                )}
              </div>

              {/* Age Demographics */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Age Groups</h3>
                <Chart
                  options={demographicsState.options}
                  series={demographicsState.series}
                  type="bar"
                  height={350}
                />
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                {loadingProducts ? (
                  <div className="flex justify-center items-center h-[350px]">
                    <Loader />
                  </div>
                ) : (
                  <Chart
                    options={productsState.options}
                    series={productsState.series}
                    type="bar"
                    height={350}
                  />
                )}
              </div>

              {/* Monthly Orders */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Orders</h3>
                {loadingMonthly ? (
                  <div className="flex justify-center items-center h-[350px]">
                    <Loader />
                  </div>
                ) : (
                  <Chart
                    options={ordersState.options}
                    series={ordersState.series}
                    type="line"
                    height={350}
                  />
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                    <p className="text-sm text-gray-600 mt-1">Track and manage your latest orders</p>
                  </div>
                  <Link 
                    to="/admin/orderlist" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <OrderList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;