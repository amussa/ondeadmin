import React from "react";
import { Link } from "react-router-dom";
import { Card } from "antd";
import {
  AppstoreAddOutlined,
  TeamOutlined,
  PlusOutlined,
  MinusOutlined,
  PieChartOutlined
} from "@ant-design/icons";

const { Meta } = Card;

const MenuStock = () => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-xl font-bold mb-4">Stock Managment</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/stock/products">
          <Card
            hoverable
            className="bg-blue-100"
            cover={<div className="text-center p-4"><AppstoreAddOutlined  style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Products</div>}
            />
          </Card>
        </Link>
        <Link to="/stock/suppliers">
          <Card
            hoverable
            className="bg-green-100"
            cover={<div className="text-center p-4"><TeamOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Suppliers</div>}
            />
          </Card>
        </Link>
        <Link to="/stock/stock-in">
          <Card
            hoverable
            className="bg-yellow-100"
            cover={<div className="text-center p-4"><PlusOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Stock In</div>}
            />
          </Card>
        </Link>
        <Link to="/stock/stock-out">
          <Card
            hoverable
            className="bg-red-100"
            cover={<div className="text-center p-4"><MinusOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Stock Out</div>}
            />
          </Card>
        </Link>
        <Link to="/stock/stock-out">
          <Card
            hoverable
            className="bg-purple-100"
            cover={<div className="text-center p-4"><PieChartOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Graphs</div>}
            />
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default MenuStock;
