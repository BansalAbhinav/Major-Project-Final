import Chart from "react-apexcharts";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
} from "../../redux/api/orderApiSlice";
import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import OrderList from "./OrderList";
import Loader from "../../components/Loader";

const AdminDashboard = () => {
  const { data: sales, isLoading } = useGetTotalSalesQuery();
  const { data: customers, isLoading: loading } = useGetUsersQuery();
  const { data: orders, isLoading: loadingTwo } = useGetTotalOrdersQuery();
  const { data: salesDetail } = useGetTotalSalesByDateQuery();

  // State for existing Sales Trend chart
  const [state, setState] = useState({
    options: {
      chart: {
        type: "line",
      },
      tooltip: {
        theme: "dark",
      },
      colors: ["#00E396"],
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: "smooth",
      },
      title: {
        text: "Sales Trend",
        align: "left",
      },
      grid: {
        borderColor: "#ccc",
      },
      markers: {
        size: 1,
      },
      xaxis: {
        categories: [],
        title: {
          text: "Date",
        },
      },
      yaxis: {
        title: {
          text: "Sales",
        },
        min: 0,
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
    },
    series: [{ name: "Sales", data: [] }],
  });

  // State for new Bar Chart
  const [barState, setBarState] = useState({
    options: {
      chart: {
        type: "bar",
        stacked: false,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "40%",
        },
      },
      colors: ["#FF4560", "#008FFB"],
      tooltip: {
        theme: "dark",
      },
      dataLabels: {
        enabled: false,
      },
      title: {
        text: "Monthly Sales Comparison",
        align: "left",
      },
      grid: {
        borderColor: "#ccc",
      },
      xaxis: {
        categories: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        title: {
          text: "Month",
        },
      },
      yaxis: {
        title: {
          text: "Sales",
        },
        min: 0,
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
      },
    },
    series: [
      { name: "Product A", data: [44, 55, 41, 67, 22, 43, 21] },
      { name: "Product B", data: [13, 23, 20, 8, 13, 27, 33] },
    ],
  });

  // State for new Doughnut Chart
  const [doughnutState, setDoughnutState] = useState({
    options: {
      chart: {
        type: "donut",
      },
      labels: ["Electronics", "Clothing", "Food", "Books"],
      colors: ["#FF4560", "#008FFB", "#00E396", "#FEB019"],
      tooltip: {
        theme: "dark",
      },
      title: {
        text: "Sales by Category",
        align: "left",
      },
      legend: {
        position: "bottom",
        labels: {
          padding: 40,
        },
      },
      dataLabels: {
        enabled: true,
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%", // Equivalent to cutout in Chart.js
          },
        },
      },
    },
    series: [400, 300, 200, 100],
  });

  // State for new Pie Chart
  const [pieState, setPieState] = useState({
    options: {
      chart: {
        type: "pie",
      },
      labels: ["Online", "In-Store", "Wholesale"],
      colors: ["#FF4560", "#008FFB", "#00E396"],
      tooltip: {
        theme: "dark",
      },
      title: {
        text: "Sales Channels",
        align: "left",
      },
      legend: {
        display: false,
      },
      dataLabels: {
        enabled: true,
      },
    },
    series: [500, 300, 200],
  });

  // State for new Line Chart
  const [lineState, setLineState] = useState({
    options: {
      chart: {
        type: "line",
      },
      tooltip: {
        theme: "dark",
      },
      colors: ["#FEB019"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      title: {
        text: "Customer Growth",
        align: "left",
      },
      grid: {
        borderColor: "#ccc",
      },
      xaxis: {
        categories: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
        ],
        title: {
          text: "Month",
        },
      },
      yaxis: {
        title: {
          text: "Customers",
        },
        min: 0,
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          opacityFrom: 0.7,
          opacityTo: 0.3,
        },
      },
    },
    series: [{ name: "Customers", data: [30, 40, 35, 50, 49, 60, 70] }],
  });

  // Existing useEffect for Sales Trend chart
  useEffect(() => {
    if (salesDetail) {
      const formattedSalesDate = salesDetail.map((item) => ({
        x: item._id,
        y: item.totalSales,
      }));

      setState((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: {
            categories: formattedSalesDate.map((item) => item.x),
          },
        },
        series: [
          { name: "Sales", data: formattedSalesDate.map((item) => item.y) },
        ],
      }));
    }
  }, [salesDetail]);

  return (
    <>
      <AdminMenu />

      <section className="xl:ml-[4rem] md:ml-[0rem]">
        <div className="w-[80%] flex justify-around flex-wrap">
          <div className="rounded-lg bg-black p-5 w-[20rem] mt-5">
            <div className="font-bold rounded-full w-[3rem] bg-pink-500 text-center p-3">
              $
            </div>
            <p className="mt-5">Sales</p>
            <h1 className="text-xl font-bold">
              $ {isLoading ? <Loader /> : sales.totalSales.toFixed(2)}
            </h1>
          </div>
          <div className="rounded-lg bg-black p-5 w-[20rem] mt-5">
            <div className="font-bold rounded-full w-[3rem] bg-pink-500 text-center p-3">
              $
            </div>
            <p className="mt-5">Customers</p>
            <h1 className="text-xl font-bold">
              {loading ? <Loader /> : customers?.length}
            </h1>
          </div>
          <div className="rounded-lg bg-black p-5 w-[20rem] mt-5">
            <div className="font-bold rounded-full w-[3rem] bg-pink-500 text-center p-3">
              $
            </div>
            <p className="mt-5">All Orders</p>
            <h1 className="text-xl font-bold">
              {loadingTwo ? <Loader /> : orders?.totalOrders}
            </h1>
          </div>
        </div>

        {/* Existing Sales Trend Chart */}
        <div className="ml-[10rem] mt-[4rem]">
          <Chart
            options={state.options}
            series={state.series}
            type="line"
            width="70%"
          />
        </div>

        {/* New Charts Section */}
        <div className="w-[80%] ml-[10rem] mt-[4rem] flex flex-wrap justify-around">
          {/* Bar Chart */}
          <div className="w-[45%] mb-[4rem]">
            <Chart
              options={barState.options}
              series={barState.series}
              type="bar"
              width="100%"
            />
          </div>

          {/* Doughnut Chart */}
          <div className="w-[45%] mb-[4rem]">
            <Chart
              options={doughnutState.options}
              series={doughnutState.series}
              type="donut"
              width="100%"
            />
          </div>

          {/* Pie Chart */}
          <div className="w-[45%] mb-[4rem]">
            <Chart
              options={pieState.options}
              series={pieState.series}
              type="pie"
              width="100%"
            />
          </div>

          {/* Line Chart */}
          <div className="w-[45%] mb-[4rem]">
            <Chart
              options={lineState.options}
              series={lineState.series}
              type="line"
              width="100%"
            />
          </div>
        </div>

        <div className="mt-[4rem]">
          <OrderList />
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;