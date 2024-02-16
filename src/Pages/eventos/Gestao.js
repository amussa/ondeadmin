import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Upload, Icon, Skeleton, Input, Select, Table, Divider, Button, Space, Modal, Form, notification, Col, Row, DatePicker, TimePicker, Typography } from "antd";
import {
    ArrowLeftOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { firebase } from '../../base';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GoogleMap, Marker, LoadScript, useJsApiLoader } from "@react-google-maps/api";
import { UploadOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

const Gestao = () => {
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
    const [modalDeleteText, setModalDeleteText] = useState('Desenha mesmo deletar este evento?');
    const [categoryData, setCategoryData] = useState([]);
    const [loadScript, setLoadScript] = useState(false);
    const [organizers, setOrganizers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [types, setTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    //Methods
    useEffect(() => {
        fetchOrganizers();
        fetchCategories();
        fetchTypes();
        fetchData();
        return () => {
            setLoadScript(false);
        };
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const db = firebase.firestore();
            const data = await db.collection("evento")
            .get();
            const disciplines = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            let notDeleted = disciplines.filter((item) => !item.deleted);
            setListGrades(notDeleted);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOrganizers = async () => {
        const db = firebase.firestore();
        const data = await db.collection("organizador").get();
        const organizers = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        console.log(organizers);
        setOrganizers(organizers);
    };

    const fetchCategories = async () => {
        const db = firebase.firestore();
        const data = await db.collection("categoria").get();
        const categories = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        console.log(categories);
        setCategories(categories);
    };

    const fetchTypes = async () => {
        const db = firebase.firestore();
        const data = await db.collection("tipo").get();
        const types = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        console.log(types);
        setTypes(types);
    };


    const showModalDelete = (record) => () => {
        formEdit.setFieldValue('id', record.id);
        setOpenDelete(true);
    };
    const handleDeleteOk = (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        firebase.firestore().collection("evento").doc(formEdit.getFieldValue('id')).update({deleted: true}).then(() => {
            notification.success({
                message: 'Success',
                description: 'Evento deletado com sucesso'
            })
            fetchData();
        }).catch((error) => {
            notification.error({
                message: 'Error',
                description: 'Erro ao deletar o evento'
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
        setLoadScript(true);
        form.resetFields();
        setOpenAdd(true);
    };

    const showEditDialog = (record) => () => {
        //formEdit.resetFields();
        setOpenEdit(true);
        setLocation({ lat: record.lat, lng: record.lng });
        formEdit.setFieldValue('id', record.id);
        formEdit.setFieldValue('name', record.name);
        formEdit.setFieldValue('category', record.category.id);
        formEdit.setFieldValue('type', record.type.id);
        formEdit.setFieldValue('organizer', record.organizer.id);
        formEdit.setFieldValue('data', moment(record.data.toDate(), 'DD/MM/YYYY'));
        let time = record.time;
        if (!moment.isMoment(time)) {
            time = moment(time, 'HH:mm');
        }
        formEdit.setFieldValue('time', time);
        formEdit.setFieldValue('location', record.location);
        formEdit.setFieldValue('description', record.description);
        formEdit.setFieldValue('coverImage', record.coverImage?[{ uid: '1', name: 'image.png', status: 'done', url: record.coverImage }]:null)

    };

    const handleAddOk = async (e) => {
        setConfirmLoading(true);
        console.log(form.getFieldsValue());
        const db = firebase.firestore();

        const imageFile = form.getFieldValue('coverImage')[0];

        const responseURI = await fetch(imageFile.thumbUrl);
        const blob = await responseURI.blob();

        const categoryID = form.getFieldValue('category');
        const typeID = form.getFieldValue('type');
        const organizerID = form.getFieldValue('organizer');

        const storageRef = getStorage();

        const imageRef = ref(storageRef, `imagens/${Date.now()}`);

        await uploadBytes(imageRef, blob);
        const url = await getDownloadURL(imageRef);

        Promise.all([
            db.collection('categoria').doc(categoryID).get(),
            db.collection('tipo').doc(typeID).get(),
            db.collection('organizador').doc(organizerID).get(),
        ]).then(([categoryDoc, typeDoc, organizerDoc]) => {
            if (!categoryDoc.exists || !typeDoc.exists || !organizerDoc.exists) {
                console.error('One of the documents does not exist');
                return;
            }

            const categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
            const typeData = { id: typeDoc.id, ...typeDoc.data() };
            const organizerData = { id: organizerDoc.id, ...organizerDoc.data() };

            const newEvent = {
                name: form.getFieldValue('name'),
                category: categoryData,
                type: typeData,
                organizer: organizerData,
                data: form.getFieldValue('data').toDate(),
                time: form.getFieldValue('time').format('HH:mm'),
                location: form.getFieldValue('location'),
                description: form.getFieldValue('description'),
                hashtags: form.getFieldValue('hashtags'),
                lat: location.lat,
                lng: location.lng,
                coverImage: url,
                views: 0,
                categoria:'novo'
            };

            db.collection('evento').add(newEvent)
                .then((docRef) => {
                    notification.success({
                        message: 'Success',
                        description: 'Evento criado com sucesso'
                    })
                    fetchData();
                })
                .catch((error) => {
                    notification.error({
                        message: 'Error',
                        description: 'Erro ao criar o evento'
                    })
                }).finally(() => {
                    setOpenAdd(false);
                    setConfirmLoading(false);
                });
        });

    };

    const handleEditOk = async (e) => {
        setConfirmLoading(true);
        const db = firebase.firestore();

        let url;
        const imageFile = formEdit.getFieldValue('coverImage')[0];

        if (imageFile.originFileObj) {
            const responseURI = await fetch(imageFile.thumbUrl);
            const blob = await responseURI.blob();

            const storageRef = getStorage();
            const imageRef = ref(storageRef, `imagens/${Date.now()}`);

            await uploadBytes(imageRef, blob);
            url = await getDownloadURL(imageRef);
        } else {
            url = imageFile.url;
        }


        const categoryID = formEdit.getFieldValue('category');
        const typeID = formEdit.getFieldValue('type');
        const organizerID = formEdit.getFieldValue('organizer');

        const storageRef = getStorage();


        Promise.all([
            db.collection('categoria').doc(categoryID).get(),
            db.collection('tipo').doc(typeID).get(),
            db.collection('organizador').doc(organizerID).get(),
        ]).then(([categoryDoc, typeDoc, organizerDoc]) => {
            if (!categoryDoc.exists || !typeDoc.exists || !organizerDoc.exists) {
                console.error('One of the documents does not exist');
                return;
            }

            const categoryData = { id: categoryDoc.id, ...categoryDoc.data() };
            const typeData = { id: typeDoc.id, ...typeDoc.data() };
            const organizerData = { id: organizerDoc.id, ...organizerDoc.data() };

            const newEvent = {
                name: formEdit.getFieldValue('name'),
                category: categoryData,
                type: typeData,
                organizer: organizerData,
                data: formEdit.getFieldValue('data').toDate(),
                time: formEdit.getFieldValue('time').format('HH:mm'),
                location: formEdit.getFieldValue('location'),
                description: formEdit.getFieldValue('description'),
                hashtags: formEdit.getFieldValue('hashtags'),
                lat: location.lat,
                lng: location.lng,
                coverImage: url
            };

            db.collection('evento').doc(formEdit.getFieldValue('id')).update(newEvent)
                .then((docRef) => {
                    notification.success({
                        message: 'Success',
                        description: 'Evento editado com sucesso'
                    })
                    fetchData();
                })
                .catch((error) => {
                    notification.error({
                        message: 'Error',
                        description: 'Erro ao editar o evento'
                    })
                }).finally(() => {
                    setOpenEdit(false);
                    setConfirmLoading(false);
                });

        });

    };


    const handleAddCancel = () => {
        setLoadScript(false);
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
            title: "Titulo",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            defaultSortOrder: 'ascend',
        },
        {
            title: "Organizador",
            dataIndex: "organizer",
            render: (organizer) => (
                <div>
                    <div>{organizer.name}</div>
                </div>
            )
        },
        {
            title: "Categoria",
            dataIndex: "category",
            width: 150,
            render: (category) => (
                <div>
                    <div>{category.name}</div>
                </div>
            )
        },
        {
            title: "Local",
            dataIndex: "location",
            width: 250,

        },
        {
            title: "Data e Hora",
            dataIndex: "data",
            width: 200,
            render: (data, record) => (
                <div>
                    <div>{moment(record.data.toDate()).format('DD/MM/YYYY')} {record.time}</div>
                </div>
            )
        },
        {
            title: "Visualizações",
            dataIndex: "views",
            width: 150,
        },
        {
            title: "Destaque",
            dataIndex: "destaque",
            width: 150,
            render: (destaque) => (
                <div>
                    <div>{destaque==true ? 'Sim' : 'Não'}</div>
                </div>
            )
        },
        {
            title: "Actions",
            key: "actions",
            width: 200,
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



    //Map the rows
    const [location, setLocation] = useState({ lat: -25.953724, lng: 32.585789 });

    const mapStyles = {
        height: "30vh",
        width: "100%",
        marginBottom: "20px"
    };

    const libraries = ['geometry', 'drawing', 'places'];

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: 'AIzaSyAKPsdDL8JAlXm2RFPrmCJKymcqcGLqNoA',
        libraries
    });

    const onSelect = event => {
        console.log(event.latLng.lat());
        console.log(event.latLng.lng());
        setLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() })
    };

    const normFile = e => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    //Select the rows
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
    };

    const handleButtonClick = () => {
        // Aqui você pode fazer algo com as linhas selecionadas
        console.log(selectedRowKeys);
    };

    const handleDestaques = () => {
        const db = firebase.firestore();

        try {
            selectedRowKeys.forEach((id) => {
                db.collection('evento').doc(id).update({ destaque: true });
            }
            );
        } finally {
            setSelectedRowKeys([]);
            fetchData();
            notification.success({
                message: 'Success',
                description: 'Eventos adcionados aos destaques'
            })
        }
    }

    const handleRemoveDestaques = () => {
        const db = firebase.firestore();

        try {
            selectedRowKeys.forEach((id) => {
                db.collection('evento').doc(id).update({ destaque: false });
            }
            );
        } finally {
            setSelectedRowKeys([]);
            fetchData();
            notification.success({
                message: 'Success',
                description: 'Eventos adcionados aos destaques'
            })
        }
    }

    const handleDelete = () => {
        const db = firebase.firestore();

        try {
            selectedRowKeys.forEach((id) => {
                db.collection('evento').doc(id).update({deleted: true})
            }
            );
        } finally {
            setSelectedRowKeys([]);
            fetchData();
            notification.success({
                message: 'Success',
                description: 'Eventos deletados com sucesso'
            })
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-xl font-bold mb-4">
                <ArrowLeftOutlined className="mr-4 hover:cursor-pointer hover:text-purple-300" onClick={() => navigate('/eventos')} />
                Gestão de Eventos
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
                    loading={isLoading}
                    dataSource={listGrades.filter(
                        (item) =>
                            item.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
                            item.id.toString().includes(idFilter)
                    )}
                    columns={columns}
                    pagination={{ pageSize: 5 }}
                    rowSelection={rowSelection}
                    rowKey={record => record.id}
                    footer={() => (
                        <div className="flex items-center justify-between">
                            <p className="mr-2">{selectedRowKeys.length} items
                                selected</p>
                            {selectedRowKeys.length > 0 && (
                                <div className="flex items-center gap-5 justify-end">
                                    <Button
                                        onClick={handleDestaques}
                                        className="bg-green-600 text-white"
                                    >
                                        Adcionar aos Destaques
                                    </Button>
                                    <Button
                                        onClick={handleRemoveDestaques}
                                        className="bg-blue-600 text-white"
                                    >
                                        Remover dos Destaques
                                    </Button>
                                    <Button
                                        onClick={handleDelete}
                                        className="bg-red-600 text-white"
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            )}
                        </div>
                    )
                    }
                />
            </div>

            {/* Modal for Delete Products */}
            <Modal
                okButtonProps={{ danger: true }}
                title="Deletar Evento"
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
                title="Adcionar Novo Evento"
                footer={[]}
                onCancel={handleAddCancel}
                open={openAdd}
                confirmLoading={confirmLoading}
                width={900}
            >
                {isLoaded &&

                    <Form form={form} layout="vertical" onFinish={handleAddOk}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="organizer"
                                    label="Organizador do Evento"
                                    rules={[{ required: true, message: "Please select the organizer" }]}
                                >
                                    <Select placeholder="Selecione o organizador do evento">
                                        {organizers.map(organizer => (
                                            <Option value={organizer.id}>{organizer.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="name"
                                    label="Nome do Evento"
                                    rules={[{ required: true, message: "Please enter the name" }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="category"
                                    label="Categoria do Evento"
                                    rules={[{ required: true, message: "Please select the category" }]}
                                >
                                    <Select placeholder="Selecione a categoria do evento">
                                        {categories.map(category => (
                                            <Option value={category.id}>{category.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="type"
                                    label="Tipo de Evento"
                                    rules={[{ required: true, message: "Please select the type" }]}
                                >
                                    <Select placeholder="Selecione o tipo do evento">
                                        {types.map(type => (
                                            <Option value={type.id}>{type.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="data"
                                    label="Data do Evento"
                                    rules={[{ required: true, message: "Please select the data" }]}
                                >
                                    <DatePicker style={{ width: '100%' }} placeholder="Selecione a Data" format={'DD/MM/YYYY'} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="time"
                                    label="Hora do Evento"
                                    rules={[{ required: true, message: "Please select the time" }]}
                                >
                                    <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Selecione a Hora" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="location"
                                    label="Local do Evento"
                                    rules={[{ required: true, message: "Please enter the location" }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Form.Item
                            name="description"
                            label="Descrição do Evento"
                            rules={[{ required: true, message: "Please enter the description" }]}
                        >
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item
                            name="hashtags"
                            label="Hashtags"
                            rules={[{ required: true, message: "Please enter the description" }]}
                        >
                            <Input.TextArea autoSize />
                        </Form.Item>
                        <Form.Item
                            name="coverImage"
                            label="Imagem de Capa"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[{ required: true, message: "Please upload the cover image" }]}
                        >
                            <Upload name="logo" listType="picture" maxCount={1} beforeUpload={() => false}>
                                <Button icon={<UploadOutlined />}>Clique para selecionar a imagem</Button>
                            </Upload>
                        </Form.Item>
                        <Typography.Title level={5}>Localização do Evento</Typography.Title>
                        <GoogleMap
                            mapContainerStyle={mapStyles}
                            zoom={13}
                            center={location}
                            onClick={onSelect}
                        >
                            <Marker key={location.lat} position={location} />
                        </GoogleMap>
                        <Form.Item>
                            <Button className="bg-red-600 text-white mr-2" onClick={handleAddCancel}>Cancelar</Button>
                            <Button className="bg-blue-600 text-white" htmlType="submit" loading={confirmLoading}>Registar</Button>
                        </Form.Item>
                    </Form>
                }
            </Modal>

            {/* Modal for Edit Products */}
            <Modal
                okButtonProps={{ className: "bg-green-600 text-white-600 cursor-pointer hover:bg-green-200 mr-2" }}
                title="Editar Informações do Evento"
                footer={[]}
                onCancel={handleEditCancel}
                open={openEdit}
                confirmLoading={confirmLoading}
                width={900}
            >
                <Form form={formEdit} layout="vertical" onFinish={handleEditOk}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="organizer"
                                label="Organizador do Evento"
                                rules={[{ required: true, message: "Please select the organizer" }]}
                            >
                                <Select placeholder="Selecione o organizador do evento">
                                    {organizers.map(organizer => (
                                        <Option value={organizer.id}>{organizer.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Nome do Evento"
                                rules={[{ required: true, message: "Please enter the name" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="Categoria do Evento"
                                rules={[{ required: true, message: "Please select the category" }]}
                            >
                                <Select placeholder="Selecione a categoria do evento">
                                    {categories.map(category => (
                                        <Option value={category.id}>{category.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="Tipo de Evento"
                                rules={[{ required: true, message: "Please select the type" }]}
                            >
                                <Select placeholder="Selecione o tipo do evento">
                                    {types.map(type => (
                                        <Option value={type.id}>{type.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="data"
                                label="Data do Evento"
                                rules={[{ required: true, message: "Please select the data" }]}
                            >
                                <DatePicker style={{ width: '100%' }} placeholder="Selecione a Data" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="time"
                                label="Hora do Evento"
                                rules={[{ required: true, message: "Please select the time" }]}
                            >
                                <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Selecione a Hora" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="location"
                                label="Local do Evento"
                                rules={[{ required: true, message: "Please enter the location" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        name="description"
                        label="Descrição do Evento"
                        rules={[{ required: true, message: "Please enter the description" }]}
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                        name="hashtags"
                        label="Hashtags"
                        rules={[{ required: true, message: "Please enter the description" }]}
                    >
                        <Input.TextArea autoSize />
                    </Form.Item>
                    <Form.Item
                        name="coverImage"
                        label="Imagem de Capa"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        rules={[{ required: true, message: "Please upload the cover image" }]}
                    >
                        <Upload name="logo" listType="picture" maxCount={1} beforeUpload={() => false}>
                            <Button icon={<UploadOutlined />}>Clique para selecionar a imagem</Button>
                        </Upload>
                    </Form.Item>
                    <Typography.Title level={5}>Localização do Evento</Typography.Title>
                    <GoogleMap
                        mapContainerStyle={mapStyles}
                        zoom={13}
                        center={location}
                        onClick={onSelect}
                    >
                        <Marker key={location.lat} position={location} />
                    </GoogleMap>
                    <Form.Item>
                        <Button className="bg-red-600 text-white mr-2" onClick={handleAddCancel}>Cancelar</Button>
                        <Button className="bg-blue-600 text-white" htmlType="submit" loading={confirmLoading}>Registar</Button>
                    </Form.Item>
                </Form>
            </Modal>


        </div>
    );
}

export default Gestao;
