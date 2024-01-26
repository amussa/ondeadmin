import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Icon, Skeleton, Input, Select, Table, Divider, Button, Space, Modal, Form, notification } from "antd";
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const Products = () => {
    //variables
    const navigate = useNavigate();
    const [listProducts, setListProducts] = useState([]);
    const [nameFilter, setNameFilter] = useState("");
    const [idFilter, setIdFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [category, setCategory] = useState("");
    const [unit, setUnit] = useState("");
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalDeleteText, setModalDeleteText] = useState('Do you want to delete this product?');
    const [categoryData, setCategoryData] = useState([]);
    //Methods
    useEffect(() => {
        const getCategories = async () => {
            axios
                .get(`${localStorage.getItem("server")}/products/list-product-category/`, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                })
                .then((res) => {
                    setCategoryData(res.data);
                })
                .catch((err) => {
                    notification.error({
                        message: "Error",
                        description: "Error loading categories",
                    });
                });
        }

        const getProducts = async () => {
            axios
                .get(`${localStorage.getItem("server")}/products/list-products/`, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem("token")}`,
                    },
                })
                .then((res) => {
                    setListProducts(res.data);
                    console.log(res.data);
                })
                .catch((err) => {
                    notification.error({
                        message: "Error",
                        description: "Error loading products",
                    });
                });
        }
        getProducts();
        getCategories();
    }, []);

    const showModalDelete = () => {
        setOpenDelete(true);
    };
    const handleDeleteOk = () => {
        setConfirmLoading(true);
        setTimeout(() => {
            setOpenDelete(false);
            setConfirmLoading(false);
        }, 2000);
    };
    const handleDeleteCancel = () => {
        console.log('Clicked cancel button');
        setOpenDelete(false);
    };

    const showModalAdd = () => {
        setOpenAdd(true);
    };

    const showEditDialog = (record) => () => {
        setOpenEdit(true);
        formEdit.setFieldsValue(record);
    };

    const handleAddOk = (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        setTimeout(() => {
            setOpenAdd(false);
            setConfirmLoading(false);
        }, 2000);
    };

    const handleEditOk = (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        setTimeout(() => {
            setOpenEdit(false);
            setConfirmLoading(false);
        }, 2000);
    };


    const handleAddCancel = () => {
        form.resetFields();
        setOpenAdd(false);
    };
    const handleEditCancel = () => {
        formEdit.resetFields();
        setOpenEdit(false);
    };
    const handleCategoryChange = (value) => {
        setCategory(value);
    };
    const handleUnitChange = (value) => {
        setUnit(value);
    };

    //Columns of the table
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            width: 100,
            key: "id",
        },
        {
            title: "Name",
            dataIndex: "name",
        },
        {
            title: "Category",
            dataIndex: "category",
            render: (text, record) => (
                <span>{record.category.name}</span>
            ),
            width: 350,
        },{
            title: "Actions",
            key: "actions",
            width: 100,
            render: (text, record) => (
                <Space size="middle">
                    <Button size="small" className="text-blue-600" type="link" onClick={showEditDialog(record)}>
                        <EditOutlined />
                    </Button>
                    <Button size="small" className="text-red-600" type="link" onClick={showModalDelete}>
                        <DeleteOutlined />
                    </Button>
                </Space>
            ),
        },
    ];

    //Test Rows
    const productsData = [
        {
            id: 1,
            name: "Produto 1",
            category: "eletronics",
            price: 750,
            unit: "piece",
            stock: 10,
        },
        {
            id: 2,
            name: "Produto 2",
            category: "Categoria 2",
            stock: 5,
        },
        {
            id: 3,
            name: "Produto 3",
            category: "Categoria 1",
            stock: 2,
        },
    ];

    return (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-xl font-bold mb-4">
                <ArrowLeftOutlined className="mr-4 hover:cursor-pointer hover:text-purple-300" onClick={() => navigate('/stock')} />
                Products
            </h1>
            <div className="px-4">

                <div className="flex gap-2 items-center mb-4">
                    <div className="flex items-center">
                        <Button onClick={showModalAdd} className="border-purple-600 text-purple-600 cursor-pointer hover:bg-green-200 mr-2">
                            Add New
                        </Button>
                        <Button className="border-purple-600 text-purple-600 cursor-pointer hover:bg-yellow-200 mr-2">
                            Import
                        </Button>
                        <Button className="border-purple-600 text-purple-600 cursor-pointer hover:bg-purple-200">
                            Export
                        </Button>
                    </div>
                    <Divider type="vertical" className="h-8" />
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
                </div>
                <Table
                    size="small"
                    dataSource={listProducts.filter(
                        (item) =>
                            item.name.includes(nameFilter) &&
                            item.id.toString().includes(idFilter) &&
                            (categoryFilter === "" || (item.category.id).toString() === (categoryFilter).toString())
                    )}
                    columns={columns}
                />
            </div>

            {/* Modal for Delete Products */}
            <Modal
                okButtonProps={{ danger: true }}
                title="Delete Product"
                open={openDelete}
                onOk={handleDeleteOk}
                confirmLoading={confirmLoading}
                onCancel={handleDeleteCancel}
            >
                <p>{modalDeleteText}</p>
            </Modal>

            {/* Modal for Add Products */}
            <Modal
                okButtonProps={{ className: "bg-green-600 text-white-600 cursor-pointer hover:bg-green-200 mr-2" }}
                title="Add Product"
                footer={[]}
                onCancel={handleAddCancel}
                open={openAdd}
                confirmLoading={confirmLoading}

            >
                <Form form={form} onSubmit={handleAddOk} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: "Please enter the product name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: "Please select a category" }]}
                    >
                        <Select value={category} onChange={handleCategoryChange}>
                            <Option value="eletronics">Eletronics</Option>
                            <Option value="food">Food</Option>
                            <Option value="cleaning">Cleaning</Option>
                            <Option value="clothes">Clothes</Option>
                            <Option value="others">Others</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="price"
                        label="Price Sale"
                        rules={[{ required: true, message: "Please enter the price of Sale" }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        name="unit"
                        label="Unit"
                        rules={[{ required: true, message: "Please select the unit" }]}
                    >
                        <Select value={unit} onChange={handleUnitChange}>
                            <Option value="piece">Piece</Option>
                            <Option value="liter">Liter</Option>
                            <Option value="kilogram">Kilogram</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button className="bg-red-600 text-white mr-2" onClick={handleAddCancel}>Cancel</Button>
                        <Button className="bg-blue-600 text-white" htmlType="submit" loading={confirmLoading} onClick={handleAddOk}>Register</Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal for Edit Products */}
            <Modal
                okButtonProps={{ className: "bg-green-600 text-white-600 cursor-pointer hover:bg-green-200 mr-2" }}
                title="Edit Product"
                footer={[]}
                onCancel={handleEditCancel}
                open={openEdit}
                confirmLoading={confirmLoading}

            >
                <Form form={formEdit} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: "Please enter the product name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: "Please select a category" }]}
                    >
                        <Select value={category} onChange={handleCategoryChange}>
                            <Option value="eletronics">Eletronics</Option>
                            <Option value="food">Food</Option>
                            <Option value="cleaning">Cleaning</Option>
                            <Option value="clothes">Clothes</Option>
                            <Option value="others">Others</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="price"
                        label="Price Sale"
                        rules={[{ required: true, message: "Please enter the price of Sale" }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        name="unit"
                        label="Unit"
                        rules={[{ required: true, message: "Please select the unit" }]}
                    >
                        <Select value={unit} onChange={handleUnitChange}>
                            <Option value="piece">Piece</Option>
                            <Option value="liter">Liter</Option>
                            <Option value="kilogram">Kilogram</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button className="bg-red-600 text-white mr-2" onClick={handleEditCancel}>Cancel</Button>
                        <Button className="bg-blue-600 text-white" htmlType="submit" loading={confirmLoading} onClick={handleEditOk}>Edit</Button>
                    </Form.Item>
                </Form>
            </Modal>


        </div>
    );
}

export default Products;
