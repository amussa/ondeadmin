import React, { useState, useEffect, useRef } from "react";
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
import imageCompression from 'browser-image-compression';
import { DownloadTableExcel } from 'react-export-table-to-excel';

const { Option } = Select;

const GestaoLocal = () => {
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
    const printRef = useRef();

    //Methods
    useEffect(() => {
        fetchCategories();
        fetchData();
        return () => {
            setLoadScript(false);
        };
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const db = firebase.firestore();
            const data = await db.collection("local").get();
            if (data.empty) {
                console.log("No matching documents.");
                return;
            } else {
                let disciplines = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                let notDeleted = disciplines.filter((item) => !item.deleted);
                setListGrades(notDeleted);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        const db = firebase.firestore();
        const data = await db.collection("categoriaLocal").get();
        const categories = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        console.log(categories);
        setCategories(categories);
    };


    const showModalDelete = (record) => () => {
        formEdit.setFieldValue('id', record.id);
        setOpenDelete(true);
    };
    const handleDeleteOk = (e) => {
        e.preventDefault();
        setConfirmLoading(true);
        firebase.firestore().collection("local").doc(formEdit.getFieldValue('id')).update({ deleted: true }).then(() => {
            notification.success({
                message: 'Success',
                description: 'Local deletado com sucesso'
            })
            fetchData();
        }).catch((error) => {
            notification.error({
                message: 'Error',
                description: 'Erro ao deletar o local'
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
        formEdit.resetFields();
        setOpenEdit(true);
        setLocation({ lat: record?.lat, lng: record?.lng });
        formEdit.setFieldValue('id', record.id);
        formEdit.setFieldValue('name', record.name);
        formEdit.setFieldValue('category', Array.isArray(record?.category) ? record?.category?.map(cat => cat.id) : [record?.category?.id]);
        let time = record.time;
        if (!moment.isMoment(time)) {
            time = moment(time, 'HH:mm');
        }
        formEdit.setFieldValue('location', record?.location);
        formEdit.setFieldValue('phone', record?.phone);
        formEdit.setFieldValue('description', record?.description);
        formEdit.setFieldValue('description_en', record?.description_en);
        formEdit.setFieldValue('hashtags', record?.hashtags);
        formEdit.setFieldValue('coverImage', record.coverImage ? [{ uid: '1', name: 'image.png', status: 'done', url: record.coverImage }] : null)

    };

    const handleAddOk = async (e) => {
        setConfirmLoading(true);
        console.log(form.getFieldsValue());
        const db = firebase.firestore();

        const imageFile = form.getFieldValue('coverImage')[0];

        // Opções de compressão
        const options = {
            maxSizeMB: 1, // Tamanho máximo do arquivo em MB
            maxWidthOrHeight: 800, // Tamanho máximo de largura ou altura
            useWebWorker: true, // Usar Web Worker para compressão em segundo plano
        };

        const responseURI = await fetch(imageFile.thumbUrl);
        const compressedFile = await imageCompression(imageFile.originFileObj, options);

        const categoryIDs = form.getFieldValue('category');

        const storageRef = getStorage();

        const imageRef = ref(storageRef, `imagens/${Date.now()}`);

        await uploadBytes(imageRef, compressedFile);
        const url = await getDownloadURL(imageRef);

        const categoryPromises = categoryIDs.map(id => db.collection('categoriaLocal').doc(id).get());
        Promise.all(categoryPromises).then((categoryDocs) => {
            const categoriesData = categoryDocs.map(doc => ({ id: doc.id, ...doc.data() }));

            const newEvent = {
                name: form.getFieldValue('name'),
                category: categoriesData,
                location: form.getFieldValue('location'),
                phone: form.getFieldValue('phone'),
                description: form.getFieldValue('description'),
                description_en: form.getFieldValue('description_en'),
                hashtags: form.getFieldValue('hashtags'),
                lat: location.lat,
                lng: location.lng,
                coverImage: url,
                views: 0
            };

            db.collection('local').add(newEvent)
                .then((docRef) => {
                    notification.success({
                        message: 'Success',
                        description: 'Local criado com sucesso'
                    })
                    fetchData();
                })
                .catch((error) => {
                    notification.error({
                        message: 'Error',
                        description: 'Erro ao criar o local'
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

        // Opções de compressão
        const options = {
            maxSizeMB: 1, // Tamanho máximo do arquivo em MB
            maxWidthOrHeight: 800, // Tamanho máximo de largura ou altura
            useWebWorker: true, // Usar Web Worker para compressão em segundo plano
        };

        if (imageFile.originFileObj) {
            const responseURI = await fetch(imageFile.thumbUrl);
            const compressedFile = await imageCompression(imageFile.originFileObj, options);

            const storageRef = getStorage();
            const imageRef = ref(storageRef, `imagens/${Date.now()}`);

            await uploadBytes(imageRef, compressedFile);
            url = await getDownloadURL(imageRef);
        } else {
            url = imageFile.url;
        }

        const categoryIDs = formEdit.getFieldValue('category');

        const categoryPromises = categoryIDs.map(id => db.collection('categoriaLocal').doc(id).get());
        Promise.all(categoryPromises).then((categoryDocs) => {
            const categoriesData = categoryDocs.map(doc => ({ id: doc.id, ...doc.data() }));

            const newEvent = {
                name: formEdit.getFieldValue('name'),
                category: categoriesData,
                location: formEdit.getFieldValue('location'),
                phone: formEdit.getFieldValue('phone'),
                description: formEdit.getFieldValue('description'),
                description_en: formEdit.getFieldValue('description_en'),
                hashtags: formEdit.getFieldValue('hashtags'),
                lat: location.lat,
                lng: location.lng,
                coverImage: url
            };

            db.collection('local').doc(formEdit.getFieldValue('id')).update(newEvent)
                .then((docRef) => {
                    notification.success({
                        message: 'Success',
                        description: 'Local editado com sucesso'
                    })
                    fetchData();
                })
                .catch((error) => {
                    notification.error({
                        message: 'Error',
                        description: 'Erro ao editar o local'
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
            title: "Nome do Local",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            defaultSortOrder: 'ascend',
        },
        {
            title: "Categoria",
            dataIndex: "category",
            width: 150,
            render: (category) => (
                <div>
                    <div>{Array.isArray(category) ? category.map(cat => cat.name).join(', ') : category.name}</div>
                </div>
            )
        },
        {
            title: "Local",
            dataIndex: "location",
            width: 250,

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
                    <div>{destaque == true ? 'Sim' : 'Não'}</div>
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

    const allColumns = [
        {
            title: "ID",
            dataIndex: "id",
            width: 100,
            key: "id",
        },
        {
            title: "Nome do Local",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            defaultSortOrder: 'ascend',
        },
        {
            title: "Categoria",
            dataIndex: "category",
            width: 150,
            render: (category) => (
                <div>
                    <div>{Array.isArray(category) ? category.map(cat => cat.name).join(', ') : category.name}</div>
                </div>
            )
        },
        {
            title: "Local",
            dataIndex: "location",
            width: 250,

        },
        {
            title: "URL Cover",
            dataIndex: "coverImage",
            width: 250,
        },
        {
            title: "Contacto",
            dataIndex: "phone",
            width: 150,
        },
        {
            title: "Descrição",
            dataIndex: "description",
            width: 150,
        },
        {
            title: "Hashtags",
            dataIndex: "hashtags",
            width: 150,
        },
        {
            title: "Latitude",
            dataIndex: "lat",
            width: 150,
        },
        {
            title: "Longitude",
            dataIndex: "lng",
            width: 150,
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
                    <div>{destaque == true ? 'Sim' : 'Não'}</div>
                </div>
            )
        },
    ]

    //Test Rows

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

    //Selection
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
                db.collection('local').doc(id).update({ destaque: true });
            }
            );
        } finally {
            setSelectedRowKeys([]);
            fetchData();
            notification.success({
                message: 'Success',
                description: 'Locais adcionados aos destaques'
            })
        }
    }

    const handleRemoveDestaques = () => {
        const db = firebase.firestore();

        try {
            selectedRowKeys.forEach((id) => {
                db.collection('local').doc(id).update({ destaque: false });
            }
            );
        } finally {
            setSelectedRowKeys([]);
            fetchData();
            notification.success({
                message: 'Success',
                description: 'Locais adcionados aos destaques'
            })
        }
    }

    const handleDelete = () => {
        const db = firebase.firestore();

        try {
            selectedRowKeys.forEach((id) => {
                db.collection('local').doc(id).update({ deleted: true })
            }
            );
        } finally {
            setSelectedRowKeys([]);
            fetchData();
            notification.success({
                message: 'Success',
                description: 'Locais deletados com sucesso'
            })
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-lg">
            <h1 className="text-xl font-bold mb-4">
                <ArrowLeftOutlined className="mr-4 hover:cursor-pointer hover:text-purple-300" onClick={() => navigate('/locais')} />
                Gestão de Locais
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
                        <DownloadTableExcel
                            filename="locais"
                            sheet="locais"
                            currentTableRef={printRef.current}
                        >
                            <Button className="border-purple-600 text-purple-600 cursor-pointer hover:bg-yellow-200 mr-2">
                                Exportar
                            </Button>
                        </DownloadTableExcel>
                    </div>
                    <Divider type="vertical" className="h-8" />
                    <input
                        type="text"
                        placeholder="Search By Name"
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                </div>
                <Table
                    size="small"
                    loading={isLoading}
                    dataSource={listGrades.filter((grade) => grade.name.toLowerCase().includes(nameFilter.toLowerCase()))}
                    columns={columns}
                    pagination={{ pageSizeOptions: ['10', '20', '50', '100'], showSizeChanger: true }}
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
                title="Deletar Local"
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
                title="Adcionar Novo Local"
                footer={[]}
                onCancel={handleAddCancel}
                open={openAdd}
                confirmLoading={confirmLoading}
                width={900}
            >
                {isLoaded &&

                    <Form form={form} layout="vertical" onFinish={handleAddOk}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="name"
                                    label="Nome do Local"
                                    rules={[{ required: true, message: "Please enter the name" }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="category"
                                    label="Categoria do Local"
                                    rules={[{ required: true, message: "Please select the category" }]}
                                >
                                    <Select
                                        placeholder="Selecione a categoria do Local"
                                        mode="multiple"
                                    >
                                        {categories.map(category => (
                                            <Option value={category.id}>{category.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="location"
                                    label="Localização"
                                    rules={[{ required: true, message: "Please enter the location" }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="phone"
                                    label="Contacto"
                                    rules={[{ required: true, message: "Please enter the contact" }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="description"
                                    label="Descrição em Português"
                                    rules={[{ required: true, message: "Please enter the description" }]}
                                >
                                    <Input.TextArea />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="description_en"
                                    label="Descrição em Inglês"
                                    rules={[{ required: true, message: "Please enter the description" }]}
                                >
                                    <Input.TextArea />
                                </Form.Item>
                            </Col>
                        </Row>
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
                        <Typography.Title level={5}>Localização no mapa</Typography.Title>
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
                title="Editar Informações do Local"
                footer={[]}
                onCancel={handleEditCancel}
                open={openEdit}
                confirmLoading={confirmLoading}
                width={900}
            >
                <Form form={formEdit} layout="vertical" onFinish={handleEditOk}>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="name"
                                label="Nome do Local"
                                rules={[{ required: true, message: "Please enter the name" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="category"
                                label="Categoria do Local"
                                rules={[{ required: true, message: "Please select the category" }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Selecione a categoria do Local">
                                    {categories.map(category => (
                                        <Option value={category.id}>{category.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="location"
                                label="Localização"
                                rules={[{ required: true, message: "Please enter the location" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="phone"
                                label="Contacto"
                                rules={[{ required: true, message: "Please enter the contact" }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="description"
                                label="Descrição em Português"
                                rules={[{ required: true, message: "Please enter the description" }]}
                            >
                                <Input.TextArea />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="description_en"
                                label="Descrição em Inglês"
                                rules={[{ required: true, message: "Please enter the description" }]}
                            >
                                <Input.TextArea />
                            </Form.Item>
                        </Col>
                    </Row>
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
                    <Typography.Title level={5}>Localização no mapa</Typography.Title>
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

            <div className="hidden">
                <Table
                    ref={printRef}
                    dataSource={listGrades}
                    columns={allColumns}
                    pagination={false}
                    rowKey="id"
                    rowClassName={() => 'custom-row'}
                />
            </div>

        </div>
    );
}

export default GestaoLocal;
