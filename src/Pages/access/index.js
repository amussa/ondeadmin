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

const MenuAccess = () => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-xl font-bold mb-4">Gestão de Acessos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <Link to="/acessos/docente">
          <Card
            hoverable
            className="bg-yellow-100"
            cover={<div className="text-center p-4"><TeamOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Docentes</div>}
            />
          </Card>
        </Link>
        <Link to="/acessos/tutor">
          <Card
            hoverable
            className="bg-red-100"
            cover={<div className="text-center p-4"><TeamOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Tutores</div>}
            />
          </Card>
        </Link>
        <Link to="/acessos/estudante">
          <Card
            hoverable
            className="bg-purple-100"
            cover={<div className="text-center p-4"><TeamOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Estudantes</div>}
            />
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default MenuAccess;
