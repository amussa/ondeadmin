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

const { Option } = Select;

const Grade = () => {
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
    const [modalDeleteText, setModalDeleteText] = useState('Desenha mesmo deletar este produto?');
    const [categoryData, setCategoryData] = useState([]);
    //Methods
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const db = firebase.firestore();
        const data = await db.collection("Disciplinas").get();
        const disciplines = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setListGrades(disciplines);
    };
    
    const showModalDelete = (record) => () => {
        formEdit.setFieldsValue(record);
        setOpenDelete(true);
    };
    const handleDeleteOk = (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        firebase.firestore().collection("Disciplinas").doc(formEdit.getFieldValue('id')).delete().then(() => {
            notification.success({
                message: 'Success',
                description: 'Disciplina deletada com sucesso'
            })
            fetchData();
        }).catch((error) => {
            notification.error({
                message: 'Error',
                description: 'Erro ao deletar a disciplina'
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

    const handleAddOk = (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        firebase.firestore().collection("Disciplinas").add({
            name: form.getFieldValue('name'),
            members: 0
        }).then(() => {
            notification.success({
                message: 'Success',
                description: 'Disciplina adicionada com sucesso'
            })
            fetchData();
        }).catch((error) => {
            notification.error({
                message: 'Error',
                description: 'Erro ao adicionar a disciplina'
            })
        }).finally(() => {
            setOpenAdd(false);
            setConfirmLoading(false);
        });
    };

    const handleEditOk = (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        firebase.firestore().collection("Disciplinas").doc(formEdit.getFieldValue('id')).update({
            name: formEdit.getFieldValue('name')
        }).then(() => {
            notification.success({
                message: 'Success',
                description: 'Disciplina editada com sucesso'
            })
            fetchData();
        }).catch((error) => {
            notification.error({
                message: 'Error',
                description: 'Erro ao editar a disciplina'
            })
        }).finally(() => {
            setOpenEdit(false);
            setConfirmLoading(false);
        });
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
            title: "Membros",
            dataIndex: "members",
            width: 150,
        },{
            title: "Actions",
            key: "actions",
            width: 250,
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
                <ArrowLeftOutlined className="mr-4 hover:cursor-pointer hover:text-purple-300" onClick={() => navigate('/tutoria')} />
                Disciplinas
            </h1>
            <div className="px-4">

                <div className="flex gap-2 items-center mb-4">
                    <div className="flex items-center">
                        <Button onClick={showModalAdd} className="border-purple-600 text-purple-600 cursor-pointer hover:bg-green-200 mr-2">
                            Adcionar
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
                />
            </div>

            {/* Modal for Delete Products */}
            <Modal
                okButtonProps={{ danger: true }}
                title="Deletar Disciplina"
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
                title="Adcionar Disciplina"
                footer={[]}
                onCancel={handleAddCancel}
                open={openAdd}
                confirmLoading={confirmLoading}

            >
                <Form form={form} onClick={handleAddOk} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Nome da Disciplina"
                        rules={[{ required: true, message: "Please enter the grade name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button className="bg-red-600 text-white mr-2" onClick={handleAddCancel}>Cancelar</Button>
                        <Button className="bg-blue-600 text-white" htmlType="submit" loading={confirmLoading} onClick={handleAddOk}>Registar</Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal for Edit Products */}
            <Modal
                okButtonProps={{ className: "bg-green-600 text-white-600 cursor-pointer hover:bg-green-200 mr-2" }}
                title="Editar Disciplina"
                footer={[]}
                onCancel={handleEditCancel}
                open={openEdit}
                confirmLoading={confirmLoading}
            >
                <Form form={formEdit} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Nome"
                        rules={[{ required: true, message: "Please enter the product name" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button className="bg-red-600 text-white mr-2" onClick={handleEditCancel}>Cancelar</Button>
                        <Button className="bg-blue-600 text-white" htmlType="submit" loading={confirmLoading} onClick={handleEditOk}>Editar</Button>
                    </Form.Item>
                </Form>
            </Modal>


        </div>
    );
}

export default Grade;
