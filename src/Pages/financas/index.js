import React from "react";
import { Link } from "react-router-dom";
import { Card } from "antd";
import {
  AppstoreAddOutlined,
  TeamOutlined,
  PlusOutlined,
  MinusOutlined,
  PieChartOutlined,
  FileOutlined,
  TransactionOutlined
} from "@ant-design/icons";

const { Meta } = Card;

const MenuFinancas = () => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-xl font-bold mb-4">Gestão de Finanças</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/financas/dashboard">
          <Card
            hoverable
            className="bg-purple-100"
            cover={<div className="text-center p-4"><PieChartOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Dashboard</div>}
            />
          </Card>
        </Link>
        <Link to="/financas/relatorio">
          <Card
            hoverable
            className="bg-red-100"
            cover={<div className="text-center p-4"><FileOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Relátorios</div>}
            />
          </Card>
        </Link>
        <Link to="/stock/stock-out">
          <Card
            hoverable
            className="bg-yellow-100"
            cover={<div className="text-center p-4"><TransactionOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Transferências</div>}
            />
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default MenuFinancas;
