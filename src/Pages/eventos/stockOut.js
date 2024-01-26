import React from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "antd";
import {
    ArrowLeftOutlined
  } from "@ant-design/icons";
const StockOut = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-xl font-bold mb-4">
                <ArrowLeftOutlined className="mr-4 hover:cursor-pointer hover:text-purple-300" onClick={()=>navigate('/stock')}/>
                Saída de Stock
            </h1>
        </div>
    );
}

export default StockOut;