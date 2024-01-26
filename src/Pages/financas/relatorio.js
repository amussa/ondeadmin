import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Icon, Skeleton, Input, Select, Table, Divider, Button, Space, Modal, Form, notification } from "antd";
import {
    EditOutlined,
    DeleteOutlined,
    CloseOutlined,
    CheckOutlined,
    EyeFilled,
    DownloadOutlined,
} from "@ant-design/icons";
import { firebase } from '../../base';
import { ArrowDownOutlined, ArrowUpOutlined, ArrowLeftOutlined, BankOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import { DatePicker } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Relatorio = () => {
    //variables
    const navigate = useNavigate();
    const [listGrades, setListGrades] = useState([]);
    const [nameFilter, setNameFilter] = useState("");
    const [idFilter, setIdFilter] = useState("");
    const [form] = Form.useForm();
    const [categoryFilter, setCategoryFilter] = useState("");
    const [dates, setDates] = useState([]);
    const [categoryData, setCategoryData] = useState([
        { id: "1", name: "Category 1" },
        { id: "2", name: "Category 2" },
        { id: "3", name: "Category 3" },
        { id: "4", name: "Category 4" },
        { id: "5", name: "Category 5" },
    ]);
    //Methods
    useEffect(() => {

    }, []);

    const fetchData = async () => {
        const db = firebase.firestore();
        const data = await db.collection("Estudantes").get();
        const disciplines = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setListGrades(disciplines);
    };

    const handleDateChange = (dates, dateStrings) => {
        if (dates && dateStrings) {
            const startDate = new Date(dateStrings[0]);
            const endDate = new Date(dateStrings[1]);
    
            console.log('Start Date:', startDate.toLocaleDateString('pt-BR'));
            console.log('End Date:', endDate.toLocaleDateString('pt-BR'));
        }else{
            console.log('no dates')
        }
    }



    //Columns of the table
    const columns = [
        {
            title: "Ref",
            dataIndex: "id",
            width: 120,
            key: "id",
        },
        {
            title: "Usuário",
            dataIndex: "name",
        },
        {
            title: "Uid",
            dataIndex: "uid",
            width: 160,
        },
        {
            title: "Tipo de Transacção",
            dataIndex: "type",
            width: 250,
        },
        {
            title: "Valor",
            dataIndex: "value",
            width: 80,
        },
        {
            title: "Data",
            dataIndex: "date",
            width: 100,
        },
        {
            title: "Actions",
            key: "actions",
            width: 90,
            align: 'center',
            render: (text, record) => (
                <Space size="middle">
                    <Button size="small" className="text-blue-600" type="link">
                        <EyeFilled />
                    </Button>
                </Space>
            ),
        },
    ];


    return (
        <>
            <div className="flex flex-col gap-4 px-4 mb-3">
                <h1 className="text-xl font-bold mb-1">
                    <ArrowLeftOutlined className="mr-4 hover:cursor-pointer hover:text-purple-300" onClick={() => navigate('/financas')} />
                    Relátorio
                </h1>
                <Row gutter={16}>
                    <Col span={6}>
                        <Card bordered={false}>
                            <Statistic
                                title="Transacções Recebidas"
                                value={0}
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
                                title="Transacções Pagas"
                                value={0}
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
                                title="Transacções Retidas"
                                value={0}
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
                                title="Nivel de Execução"
                                value={0}
                                precision={2}
                                valueStyle={{
                                    color: 'rgb(26, 24, 36)',
                                    fontSize: 18,
                                }}
                                prefix={<ArrowUpOutlined />}
                                suffix="%"
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
            <div className="flex flex-col gap-4 mx-4 p-4 bg-white rounded-lg shadow-lg">
                <div className="px-4">
                    <div className="flex gap-2 items-center mb-4">
                        <RangePicker
                            onChange={handleDateChange}
                            className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        />
                        <input
                            type="text"
                            placeholder="Search By Name"
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        />
                        <input
                            type="text"
                            placeholder="Search By ID"
                            value={idFilter}
                            onChange={(e) => setIdFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            {categoryData.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        <Divider type="vertical" className="h-8" />
                        <div className="flex items-center">
                            <Button className="border-purple-600 text-purple-600 cursor-pointer hover:bg-yellow-200 mr-2">
                                <DownloadOutlined />
                                PDF
                            </Button>
                            <Button className="border-purple-600 text-purple-600 cursor-pointer hover:bg-purple-200">
                                <DownloadOutlined />
                                EXCEL
                            </Button>
                        </div>

                    </div>
                    <Table
                        size="small"
                        dataSource={listGrades.filter(
                            (item) =>
                                item.name.includes(nameFilter) &&
                                item.id.toString().includes(idFilter)
                        )}
                        columns={columns}
                    />
                </div>

            </div>
        </>
    );
}

export default Relatorio;
