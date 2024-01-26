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
} from "@ant-design/icons";

const { Meta } = Card;

const MenuTutoria = () => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-xl font-bold mb-4">Gestão Tutoria</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/tutoria/disciplina">
          <Card
            hoverable
            className="bg-blue-100"
            cover={<div className="text-center p-4"><AppstoreAddOutlined  style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Disciplinas</div>}
            />
          </Card>
        </Link>
        <Link to="/tutoria/pacote">
          <Card
            hoverable
            className="bg-green-100"
            cover={<div className="text-center p-4"><BookOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Pacotes de Tutoria</div>}
            />
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default MenuTutoria;
