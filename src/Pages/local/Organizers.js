import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Icon, Skeleton, Input, Select, Table, Divider, Button, Space, Modal, Form, notification } from "antd";
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { firebase } from '../../base';
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
const { Option } = Select;

const Organizadores = () => {
    //variables
    const navigate = useNavigate();
    const [listGrades, setListGrades] = useState([]);
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
    const [modalDeleteText, setModalDeleteText] = useState('Desenha mesmo deletar este organizador?');
    const [categoryData, setCategoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    //Methods
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const db = firebase.firestore();
            const data = await db.collection("organizador").get();
            const disciplines = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setListGrades([]);
            if (disciplines.length > 0) {
                console.log(disciplines);
                setListGrades(disciplines);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const showModalDelete = (record) => () => {
        formEdit.setFieldsValue(record);
        setOpenDelete(true);
    };
    const handleDeleteOk = (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        firebase.firestore().collection("organizador").doc(formEdit.getFieldValue('id')).delete().then(() => {
            notification.success({
                message: 'Success',
                description: 'Organizador deletado com sucesso'
            })
            fetchData();
        }).catch((error) => {
            notification.error({
                message: 'Error',
                description: 'Erro ao deletar a Organizador'
            })
        }).finally(() => {
            setOpenDelete(false);
            setConfirmLoading(false);
        });
    };
    const handleDeleteCancel = () => {
        setOpenDelete(false);
    };

    const showModalAdd = () => {
        form.resetFields();
        setOpenAdd(true);
    };

    const showEditDialog = (record) => () => {
        setOpenEdit(true);
        formEdit.setFieldsValue(record);
    };

    const handleAddOk = async () => {
        setConfirmLoading(true);
        console.log(form.getFieldsValue());

        const db = firebase.firestore();
        try {
            await db.collection("organizador").add({
                name: form.getFieldValue('name'),
                phone: form.getFieldValue('phone'),
                email: form.getFieldValue('email'),
                address: form.getFieldValue('address'),
                description: form.getFieldValue('description'),
            });
            notification.success({
                message: 'Success',
                description: 'Organizador registado com sucesso'
            });
            fetchData();

        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Erro ao registar o organizador'
            });
        } finally {
            setOpenAdd(false);
            setConfirmLoading(false);
        }
    };

    const handleEditOk = async (e) => {
        setConfirmLoading(true);
        const db = firebase.firestore();
        const pacoteId = formEdit.getFieldValue('id'); // get the id of the pacote to update
        const updatedData = {
            name: formEdit.getFieldValue('name'),
            phone: formEdit.getFieldValue('phone'),
            email: formEdit.getFieldValue('email'),
            address: formEdit.getFieldValue('address'),
            description: formEdit.getFieldValue('description'),
        };

        try {
            await db.collection("organizador").doc(pacoteId).update(updatedData);
            notification.success({
                message: 'Success',
                description: 'Organizer updated successfully'
            });
            fetchData();
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Error updating organizer'
            });
        } finally {
            setOpenEdit(false);
            setConfirmLoading(false);
        }
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
            title: "Nome",
            dataIndex: "name",
        },
        {
            title: "Telefone",
            dataIndex: "subject",
            render: (text, record) => (
                <span>{record.phone}</span>
            ),
        },
        {
            title: "Email",
            dataIndex: "subject",
            render: (text, record) => (
                <span>{record.email}</span>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 150,
            render: (text, record) => (
                <Space size="middle">
                    <Button size="small" className="text-blue-600" type="link" onClick={showEditDialog(record)}>
                        <EditOutlined />
                    </Button>
                    <Button size="small" className="text-red-600" type="link" onClick={showModalDelete(record)}>
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
                <ArrowLeftOutlined className="mr-4 hover:cursor-pointer hover:text-purple-300" onClick={() => navigate('/eventos')} />
                Organizadores de Eventos
            </h1>
            <div className="px-4">

                <div className="flex gap-2 items-center mb-4">
                    <div className="flex items-center">
                        <Button onClick={showModalAdd} className="border-purple-600 text-purple-600 cursor-pointer hover:bg-green-200 mr-2">
                            Adicionar
                        </Button>
                        <Button className="border-purple-600 text-purple-600 cursor-pointer hover:bg-yellow-200 mr-2">
                            Importar
                        </Button>
                        <Button className="border-purple-600 text-purple-600 cursor-pointer hover:bg-purple-200">
                            Exportar
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
                </div>
                <Table
                    size="small"
                    dataSource={listGrades.filter(
                        (item) =>
                            item.name.includes(nameFilter) &&
                            item.id.toString().includes(idFilter)
                    )}
                    columns={columns}
                    loading={isLoading}
                />
            </div>

            {/* Modal for Delete Products */}
            <Modal
                okButtonProps={{ danger: true }}
                title="Deletar Organizador"
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
                title="Adicionar Novo Organizador"
                footer={[]}
                onCancel={handleAddCancel}
                open={openAdd}
                width={700}
                confirmLoading={confirmLoading}

            >
                <Form form={form} layout="vertical" onFinish={handleAddOk}>
                    <Form.Item
                        name="name"
                        label="Nome do Organizador"
                        rules={[{ required: true, message: "Please enter the name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Telefone"
                        rules={[{ required: true, message: "Please enter the phone number" }]}
                    >
                        <PhoneInput
                            international
                            defaultCountry="MZ"
                            style={{
                                width: '100%',
                                height: '32px',
                                padding: '4px 11px',
                                fontSize: '14px',
                                lineHeight: '1.5715',
                                color: 'rgba(0, 0, 0, 0.65)',
                                backgroundColor: '#fff',
                                border: '1px solid #d9d9d9',
                                borderRadius: 6,
                                transition: 'all .3s',
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, message: "Please enter the email" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Endereço"
                        rules={[{ required: true, message: "Please enter the address" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Descrição do Organizador"
                        rules={[{ required: true, message: "Please enter the description" }]}
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item>
                        <Button className="bg-red-600 text-white mr-2" onClick={handleAddCancel}>Cancelar</Button>
                        <Button className="bg-blue-600 text-white" htmlType="submit" loading={confirmLoading}>Registar</Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal for Edit Products */}
            <Modal
                okButtonProps={{ className: "bg-green-600 text-white-600 cursor-pointer hover:bg-green-200 mr-2" }}
                title="Editar Informação do Organizador"
                footer={[]}
                onCancel={handleEditCancel}
                open={openEdit}
                width={700}
                confirmLoading={confirmLoading}
            >
                <Form form={formEdit} layout="vertical" onFinish={handleEditOk}>
                    <Form.Item
                        name="name"
                        label="Nome do Organizador"
                        rules={[{ required: true, message: "Please enter the name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Telefone"
                        rules={[{ required: true, message: "Please enter the phone number" }]}
                    >
                        <PhoneInput
                            international
                            defaultCountry="MZ"
                            style={{
                                width: '100%',
                                height: '32px',
                                padding: '4px 11px',
                                fontSize: '14px',
                                lineHeight: '1.5715',
                                color: 'rgba(0, 0, 0, 0.65)',
                                backgroundColor: '#fff',
                                border: '1px solid #d9d9d9',
                                borderRadius: 6,
                                transition: 'all .3s',
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, message: "Please enter the email" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Endereço"
                        rules={[{ required: true, message: "Please enter the address" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="Descrição do Organizador"
                        rules={[{ required: true, message: "Please enter the description" }]}
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item>
                        <Button className="bg-red-600 text-white mr-2" onClick={handleEditCancel}>Cancelar</Button>
                        <Button className="bg-blue-600 text-white" htmlType="submit" loading={confirmLoading}>Editar</Button>
                    </Form.Item>
                </Form>
            </Modal>


        </div>
    );
}

export default Organizadores;
