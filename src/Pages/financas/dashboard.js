import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowDownOutlined, ArrowUpOutlined, ArrowLeftOutlined, BankOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import { Chart } from "react-google-charts";
import { LineChart, PieChart, Pie, Sector, Cell, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DashboardFinancas = () => {
    const navigate = useNavigate();
    const data = [
        ["Carteira", "Valor"],
        ["Mpesa", 11750],
        ["Emola", 8910],
        ["Mkesh", 4700],
    ];
    const sales = [
        {
            Data: "03/10/2023",
            Arrecadações: 4000,
            Pagamentos: 2400,
        },
        {
            Data: "04/10/2023",
            Arrecadações: 3000,
            Pagamentos: 1398,
        },
        {
            Data: "05/10/2023",
            Arrecadações: 2000,
            Pagamentos: 9800,
        },
        {
            Data: "06/10/2023",
            Arrecadações: 2780,
            Pagamentos: 3908,
        },
        {
            Data: "07/10/2023",
            Arrecadações: 1890,
            Pagamentos: 4800,
        },
        {
            Data: "08/10/2023",
            Arrecadações: 2390,
            Pagamentos: 3800,
        },
        {
            Data: "09/10/2023",
            Arrecadações: 3490,
            Pagamentos: 4300,
        },

    ];

    const options = {
        legend: { position: "bottom", maxLines: 3 },
        pieHole: 0.65,
        is3D: false,
        chartArea: { position: 'relative', left: 50, right: 50, bottom: 50, top: 50 },
        width: "100%",
        height: 350,
    };

    const optionSales = {
        hAxis: { titleTextStyle: { color: "#333" } },
        vAxis: { minValue: 0 },
        chartArea: { position: 'relative', left: 50, right: 50, bottom: 50, top: 50 },
        width: "100%",
        height: 350,
        legend: { position: "bottom", maxLines: 3 },

    };
    return (
        <div className="flex flex-col px-4 py-2">
            <h1 className="text-xl font-bold mb-4">
                <ArrowLeftOutlined className="mr-4 hover:cursor-pointer hover:text-purple-300" onClick={() => navigate('/financas')} />
                Dashboard
            </h1>
            <div className="flex flex-col px-2">
                <Row gutter={16}>
                    <Col span={6}>
                        <Card bordered={false}>
                            <Statistic
                                title="Receita Bruta"
                                value={27950}
                                precision={2}
                                valueStyle={{
                                    color: 'rgb(26, 24, 36)',
                                    fontSize: 18,
                                }}
                                prefix={<BankOutlined />}
                                suffix="MZN"
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card bordered={false}>
                            <Statistic
                                title="Receita Líquida"
                                value={11205}
                                precision={2}
                                valueStyle={{
                                    color: 'rgb(26, 24, 36)',
                                    fontSize: 18,
                                }}
                                prefix={<ArrowUpOutlined />}
                                suffix="MZN"
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card bordered={false}>
                            <Statistic
                                title="Retenções"
                                value={6145}
                                precision={2}
                                valueStyle={{
                                    color: 'rgb(26, 24, 36)',
                                    fontSize: 18,
                                }}
                                prefix={<ArrowRightOutlined />}
                                suffix="MZN"
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card bordered={false}>
                            <Statistic
                                title="Pagamento"
                                value={9120}
                                precision={2}
                                valueStyle={{
                                    color: 'rgb(26, 24, 36)',
                                    fontSize: 18,
                                }}
                                prefix={<ArrowDownOutlined />}
                                suffix="MZN"
                            />
                        </Card>
                    </Col>
                </Row>
                <Row gutter={16} className="mt-4">
                    <Col span={16}>
                        <ResponsiveContainer style={{ backgroundColor: 'white', borderRadius: 8, padding: 30 }} width="100%" height="100%">
                            <LineChart
                                data={sales}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="Data" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Arrecadações" stroke="#8884d8" activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="Pagamentos" stroke="red" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Col>
                    <Col span={8}>
                        <ResponsiveContainer style={{ backgroundColor: 'white', borderRadius: 8, padding: 30 }} width="100%" height="100%">
                            <Chart
                                chartType="PieChart"
                                data={data}
                                options={options}
                            />
                        </ResponsiveContainer>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default DashboardFinancas;
