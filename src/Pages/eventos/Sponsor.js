import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Icon, Skeleton, Input, Select, Table, Divider, Button, Space, Modal, Form, notification, Upload } from "antd";
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined
} from "@ant-design/icons";
import { firebase } from '../../base';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

const { Option } = Select;

const Sponsor = () => {
    //variables
    const navigate = useNavigate();
    const [listGrades, setListGrades] = useState([]);
    const [nameFilter, setNameFilter] = useState("");
    const [idFilter, setIdFilter] = useState("");
    const [form] = Form.useForm();
    const [formEdit] = Form.useForm();
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalDeleteText, setModalDeleteText] = useState('Desenha mesmo deletar este patrocinador?');
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    //Methods
    useEffect(() => {
        fetchData();
        fetchCategories();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const db = firebase.firestore();
            const data = await db.collection("sponsor").get();
            const disciplines = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            setListGrades(disciplines);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        const db = firebase.firestore();
        const data = await db.collection("categoria").get();
        let categories = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        //order ascending
        categories.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        setCategories(categories);
    };

    const showModalDelete = (record) => () => {
        formEdit.setFieldValue('id', record?.id);
        setOpenDelete(true);
    };
    const handleDeleteOk = (e) => {
        setConfirmLoading(true);
        firebase.firestore().collection("sponsor").doc(formEdit.getFieldValue('id')).delete().then(() => {
            notification.success({
                message: 'Success',
                description: 'Patrocinador deletado com sucesso'
            })
            fetchData();
        }).catch((error) => {
            notification.error({
                message: 'Error',
                description: 'Erro ao deletar o patrocinador'
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
        setConfirmLoading(false);
        form.resetFields();
        setOpenAdd(true);
    };

    const showEditDialog = (record) => () => {
        setConfirmLoading(false);
        try{
        formEdit.resetFields();
        formEdit.setFieldValue('id', record.id);
        formEdit.setFieldValue('name', record.name);
        formEdit.setFieldValue('coverImage', record?.coverImage ? [{ uid: '1', name: 'image.png', status: 'done', url: record?.coverImage }] : null)
        formEdit.setFieldValue('link', record.link);
        formEdit.setFieldValue('category', record.categories);
        setOpenEdit(true);
        }
        catch(error){
            console.log(error);
        }
    };

    const optionsImage = {
        maxSizeMB: 1, // Tamanho máximo do arquivo em MB
        maxWidthOrHeight: 800, // Tamanho máximo de largura ou altura
        useWebWorker: true, // Usar Web Worker para compressão em segundo plano
    };

    const handleAddOk = async (e) => {
        setConfirmLoading(true);
        try {
            let url;
            const imageFile = form.getFieldValue('coverImage')[0];

            if (imageFile.originFileObj) {
                const responseURI = await fetch(imageFile.thumbUrl);
                const compressedFile = await imageCompression(imageFile.originFileObj, optionsImage);

                const storageRef = getStorage();
                const imageRef = ref(storageRef, `imagens/${Date.now()}`);

                await uploadBytes(imageRef, compressedFile);
                url = await getDownloadURL(imageRef);
            } else {
                url = imageFile.url;
            }

            firebase.firestore().collection("sponsor").add({
                name: form.getFieldValue('name'),
                coverImage: url,
                link: form.getFieldValue('link'),
                categories: form.getFieldValue('category')
            }).then(() => {
                notification.success({
                    message: 'Success',
                    description: 'Patrocinador adicionado com sucesso'
                })
                fetchData();
            }
            )
        }
        catch (error) {
            console.log(error);
            notification.error({
                message: 'Error',
                description: 'Erro ao adicionar o patrocinador'
            })
        } finally {
            setOpenAdd(false);
            setConfirmLoading(false);
        }
    };

    const handleEditOk = async(e) => {
        setConfirmLoading(true);
        try {
            let url;
            const imageFile = formEdit.getFieldValue('coverImage')[0];

            if (imageFile.originFileObj) {
                const responseURI = await fetch(imageFile.thumbUrl);
                const compressedFile = await imageCompression(imageFile.originFileObj, optionsImage);

                const storageRef = getStorage();
                const imageRef = ref(storageRef, `imagens/${Date.now()}`);

                await uploadBytes(imageRef, compressedFile);
                url = await getDownloadURL(imageRef);
            } else {
                url = imageFile.url;
            }

            firebase.firestore().collection("sponsor").doc(formEdit.getFieldValue('id')).update({
                name: formEdit.getFieldValue('name'),
                coverImage: url,
                link: formEdit.getFieldValue('link'),
                categories: formEdit.getFieldValue('category')
            }).then(() => {
                notification.success({
                    message: 'Success',
                    description: 'Patrocinador editado com sucesso'
                })
                fetchData();
            }
            )
        }
        catch (error) {
            console.log(error);
            notification.error({
                message: 'Error',
                description: 'Erro ao editar o patrocinador'
            })
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
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
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

    const normFile = e => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-xl font-bold mb-4">
                <ArrowLeftOutlined className="mr-4 hover:cursor-pointer hover:text-purple-300" onClick={() => navigate('/eventos')} />
                Patrocinadores
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
                            item?.name?.includes(nameFilter) &&
                            item?.id?.toString().includes(idFilter)
                    )}
                    columns={columns}
                    loading={isLoading}
                />
            </div>

            {/* Modal for Delete Products */}
            <Modal
                okButtonProps={{ danger: true }}
                title="Deletar Patrocinador"
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
                title="Adicionar Patrocinador"
                footer={[]}
                onCancel={handleAddCancel}
                open={openAdd}
                confirmLoading={confirmLoading}

            >
                <Form form={form} onFinish={handleAddOk} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Nome do Patrocinador"
                        rules={[{ required: true, message: "Por favor insira o nome do patrocinador" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="coverImage"
                        label="Logo do Patrocinador"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[{ required: true, message: "Por favor insira o logo do patrocinador" }]}
                    >
                        <Upload name="logo" listType="picture" maxCount={1} beforeUpload={() => false}>
                            <Button icon={<UploadOutlined />}>Clique para selecionar a imagem</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        name="link"
                        label="Link do Patrocinador"
                        rules={[{ required: true, message: "Por favor insira o link do patrocinador" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="category"
                        label="Categorias de Eventos"
                        rules={[{ required: true, message: "Please select the category" }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Selecione a(s) categoria(s)"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {categories.map(category => (
                                <Option value={category.id}>{category.name}</Option>
                            ))}
                        </Select>
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
                title="Editar Patrocinador"
                footer={[]}
                onCancel={handleEditCancel}
                open={openEdit}
                confirmLoading={confirmLoading}
            >
                <Form form={formEdit} layout="vertical" onFinish={handleEditOk}>
                    <Form.Item
                        name="name"
                        label="Nome do Patrocinador"
                        rules={[{ required: true, message: "Por favor insira o nome do patrocinador" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="coverImage"
                        label="Logo"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[{ required: true, message: "Por favor insira o Logo do patrocinador" }]}
                    >
                        <Upload name="logo" listType="picture" maxCount={1} beforeUpload={() => false}>
                            <Button icon={<UploadOutlined />}>Clique para selecionar a imagem</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item
                        name="link"
                        label="Link do Patrocinador"
                        rules={[{ required: true, message: "Por favor insira o link do patrocinador" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="category"
                        label="Categorias de Eventos"
                        rules={[{ required: true, message: "Please select the category" }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Selecione a(s) categoria(s)"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {categories.map(category => (
                                <Option value={category.id}>{category.name}</Option>
                            ))}
                        </Select>
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

export default Sponsor;
