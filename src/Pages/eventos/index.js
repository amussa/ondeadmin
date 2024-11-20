import React from "react";
import { Link } from "react-router-dom";
import { Card } from "antd";
import {
  AppstoreAddOutlined,
  TeamOutlined,
  CalendarOutlined,
  ShareAltOutlined
} from "@ant-design/icons";

const { Meta } = Card;

const MenuTutoria = () => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-xl font-bold mb-4">Gestão de Eventos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/eventos/gestao">
          <Card
            hoverable
            className="bg-blue-100"
            cover={<div className="text-center p-4"><CalendarOutlined  style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Eventos</div>}
            />
          </Card>
        </Link>
        <Link to="/eventos/organizer">
          <Card
            hoverable
            className="bg-green-100"
            cover={<div className="text-center p-4"><TeamOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Organizadores</div>}
            />
          </Card>
        </Link>
        <Link to="/eventos/category">
          <Card
            hoverable
            className="bg-orange-100"
            cover={<div className="text-center p-4"><AppstoreAddOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Categorias de Eventos</div>}
            />
          </Card>
        </Link>
        <Link to="/eventos/sponsor">
          <Card
            hoverable
            className="bg-red-100"
            cover={<div className="text-center p-4"><ShareAltOutlined style={{ fontSize: '48px' }} /></div>}
          >
            <Meta
              title={<div className="text-center">Patrocinadores</div>}
            />
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default MenuTutoria;
