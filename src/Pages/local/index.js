import React from "react";
import { Link } from "react-router-dom";
import { Card } from "antd";
import {
  AppstoreAddOutlined,
  TeamOutlined,
  PlusOutlined,
  MinusOutlined,
  PieChartOutlined,
  BookOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  LinkedinOutlined,
  ToolOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";

const { Meta } = Card;

const MenuLocal = () => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-xl font-bold mb-4">Gestão de Locais</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/locais/gestao">
          <Card
            hoverable
            className="bg-blue-100"
            cover={<div className="text-center p-4"><EnvironmentOutlined  style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Locais</div>}
            />
          </Card>
        </Link>
        <Link to="/locais/category">
          <Card
            hoverable
            className="bg-orange-100"
            cover={<div className="text-center p-4"><AppstoreAddOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Categorias</div>}
            />
          </Card>
        </Link>
        <Link to="/locais/services">
          <Card
            hoverable
            className="bg-green-100"
            cover={<div className="text-center p-4"><SafetyCertificateOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Serviços</div>}
            />
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default MenuLocal;
