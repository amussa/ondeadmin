import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Upload, Icon, Skeleton, Input, Select, Table, Divider, Button, Space, Modal, Form, notification, Col, Row, DatePicker, TimePicker, Typography, Radio } from "antd";
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
import '../../Components/css/explore.css'

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
    const [places, setPlaces] = useState([]);

    //Methods
    useEffect(() => {
        fetchOrganizers();
        fetchCategories();
        fetchTypes();
        fetchData();
        fetchPlaces();
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
            //order by name
            notDeleted.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
            setListGrades(notDeleted);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPlaces = async () => {
        const db = firebase.firestore();
        const data = await db.collection("local")
            .get();
        if (data.empty) {
            console.log("No matching documents.");
            return;
        } else {
            let disciplines = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            let notDeleted = disciplines.filter((item) => !item.deleted);
            //order by name
            notDeleted.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
            setPlaces(notDeleted);
        }
    }

    const fetchOrganizers = async () => {
        const db = firebase.firestore();
        const data = await db.collection("organizador").get();
        let organizers = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        //order ascending
        organizers.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        setOrganizers(organizers);
    };

    const fetchCategories = async () => {
        const db = firebase.firestore();
        const data = await db.collection("categoria").get();
        let categories = data.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        //order ascending
        categories.sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
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
        firebase.firestore().collection("evento").doc(formEdit.getFieldValue('id')).update({ deleted: true }).then(() => {
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

    const [recurring, setRecurring] = useState(false);

    const showModalAdd = () => {
        setRecurring(false);
        setConfirmLoading(false);
        setLoadScript(true);
        form.resetFields();
        form.setFieldsValue({ isRecurring: false });
        setRecurring(false);
        setOpenAdd(true);
    };

    const showEditDialog = (record) => () => {
        console.log(record);
        formEdit.resetFields();
        setOpenEdit(true);
        setLocation({ lat: record.lat, lng: record.lng, location: record.locationName });
        formEdit.setFieldValue('id', record.id);
        formEdit.setFieldValue('name', record.name);
        formEdit.setFieldValue('category', Array.isArray(record?.category) ? record?.category?.map(cat => cat.id) : [record?.category?.id]);
        formEdit.setFieldValue('organizer', record.organizer.id);
        formEdit.setFieldValue('data', moment(record.data.toDate(), 'DD/MM/YYYY'));
        let time = record.time;
        if (!moment.isMoment(time)) {
            time = moment(time, 'HH:mm');
        }
        formEdit.setFieldValue('time', time);
        formEdit.setFieldValue('location', places.filter(place => place.name === record.location)[0].id);
        formEdit.setFieldValue('description', record.description);
        formEdit.setFieldValue('description_en', record.description_en);
        formEdit.setFieldValue('hashtags', record.hashtags);
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

        const organizerID = form.getFieldValue('organizer');

        const storageRef = getStorage();

        const compressedFile = await imageCompression(imageFile.originFileObj, options);
        const imageRef = ref(storageRef, `imagens/${Date.now()}`);

        await uploadBytes(imageRef, compressedFile);
        const url = await getDownloadURL(imageRef);

        const categoryIDs = form.getFieldValue('category');

        let categoryPromises = categoryIDs.map(id => db.collection('categoria').doc(id).get());
        let categoryDocs = await Promise.all(categoryPromises);
        let categoriesData = categoryDocs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(categoriesData);

        Promise.all([
            db.collection('organizador').doc(organizerID).get(),
        ]).then(([organizerDoc]) => {
            if (!organizerDoc.exists) {
                console.error('One of the documents does not exist');
                return;
            }

            const organizerData = { id: organizerDoc.id, ...organizerDoc.data() };

            let newEvent = {
                name: form.getFieldValue('name'),
                category: categoriesData,
                organizer: organizerData,
                data: form.getFieldValue('data').toDate(),
                time: form.getFieldValue('time').format('HH:mm'),
                location: places.filter(place => place.id === form.getFieldValue('location'))[0].name,
                description: form.getFieldValue('description'),
                description_en: form.getFieldValue('description_en'),
                hashtags: form.getFieldValue('hashtags'),
                lat: location.lat,
                lng: location.lng,
                locationName: location.location,
                coverImage: url,
                views: 0,
                categoria: 'novo'
            };

            let repeat = form.getFieldValue('isRecurring');
            if (repeat && parseInt(form.getFieldValue('frequency')) > 1) {
                for (let i = 1; i <= parseInt(form.getFieldValue('frequency')); i++) {
                    newEvent.data = moment(newEvent.data).add(7, 'days').toDate();
                    db.collection('evento').add(newEvent)
                        .then((docRef) => {
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
                }
                notification.success({
                    message: 'Success',
                    description: 'Eventos criados com sucesso'
                })
            } else {
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
            }


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
        console.log(categoryIDs)


        const organizerID = formEdit.getFieldValue('organizer');

        const storageRef = getStorage();


        Promise.all([
            db.collection('categoria').where(firebase.firestore.FieldPath.documentId(), 'in', categoryIDs).get(),
            db.collection('organizador').doc(organizerID).get(),
        ]).then(([categoryDoc, organizerDoc]) => {


            const organizerData = { id: organizerDoc.id, ...organizerDoc.data() };
            const categoriesData = categoryDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const newEvent = {
                name: formEdit.getFieldValue('name'),
                category: categoriesData,
                organizer: organizerData,
                data: formEdit.getFieldValue('data').toDate(),
                time: formEdit.getFieldValue('time').format('HH:mm'),
                location: places.filter(place => place.id === formEdit.getFieldValue('location'))[0].name,
                description: formEdit.getFieldValue('description'),
                description_en: formEdit.getFieldValue('description_en'),
                hashtags: formEdit.getFieldValue('hashtags'),
                lat: location.lat,
                lng: location.lng,
                locationName: location.location,
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
            title: "Data",
            dataIndex: "data",
            width: 200,
            render: (data, record) => (
                <div>
                    <div>{moment(record.data.toDate()).format('DD/MM/YYYY')} {record.time}</div>
                </div>
            ),
            sorter: (a, b) => moment(a.data.toDate()).unix() - moment(b.data.toDate()).unix(),
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
                db.collection('evento').doc(id).update({ deleted: true })
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

    const handleSelectPlace = (value) => {
        console.log(value);
        const place = places.find(place => place?.id === value);
        setLocation({ lat: place?.lat, lng: place?.lng, location: place?.location });
    }

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
                                    required={[{ required: true, message: "Please select the organizer" }]}
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
                            <Col span={24}>
                                <Form.Item
                                    name="category"
                                    label="Categoria do Evento"
                                    rules={[{ required: true, message: "Please select the category" }]}
                                >
                                    <Select mode="multiple" placeholder="Selecione a categoria do evento">
                                        {categories.map(category => (
                                            <Option value={category.id}>{category.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={6}>
                                <Form.Item
                                    name="data"
                                    label="Data do Evento"
                                    rules={[{ required: true, message: "Please select the data" }]}
                                >
                                    <DatePicker 
                                    style={
                                        { width: '100%' }
                                    }
                                    
                                    placeholder="Selecione a Data" 
                                    format={'DD/MM/YYYY'} 
                                    
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name="time"
                                    label="Hora do Evento"
                                    rules={[{ required: true, message: "Please select the time" }]}
                                    className="tp"
                                >
                                    <TimePicker className="tp" format="HH:mm" style={{ width: '100%' }} placeholder="Selecione a Hora" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name="isRecurring"
                                    label="Evento recorrente?"
                                    rules={[{ required: true, message: "Por favor, selecione uma opção" }]}
                                >
                                    <Radio.Group onChange={(e) => setRecurring(e.target.value)}>
                                        <Radio value={true}>Sim</Radio>
                                        <Radio value={false}>Não</Radio>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name="frequency"
                                    label="Repetições(semanas)"
                                    rules={[{
                                        required: recurring,
                                        message: "Please enter the frequency"
                                    }
                                    ]}

                                >
                                    <Input type="number" disabled={!recurring} min={1} max={52} />
                                </Form.Item>
                            </Col>

                        </Row>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="location"
                                    label="Local do Evento"
                                    rules={[{ required: true, message: "Please enter the location" }]}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Selecione o local do evento"
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                        onChange={handleSelectPlace}
                                    >
                                        {places.map(place => (
                                            <Option value={place.id}>{place.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="description"
                                    label="Descrição do Evento em Português"
                                    rules={[{ required: true, message: "Please enter the description" }]}
                                >
                                    <Input.TextArea />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="description_en"
                                    label="Descrição do Evento em Inglês"
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
                                required={[{ required: true, message: "Please select the organizer" }]}
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
                        <Col span={24}>
                            <Form.Item
                                name="category"
                                label="Categoria do Evento"
                                rules={[{ required: true, message: "Please select the category" }]}
                            >
                                <Select mode='multiple' placeholder="Selecione a categoria do evento">
                                    {categories.map(category => (
                                        <Option value={category.id}>{category.name}</Option>
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
                                <TimePicker popupClassName="tp" format="HH:mm" style={{ width: '100%' }} placeholder="Selecione a Hora" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="location"
                                label="Local do Evento"
                                rules={[{ required: true, message: "Please enter the location" }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Selecione o local do evento"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    onChange={handleSelectPlace}
                                >
                                    {places.map(place => (
                                        <Option value={place.id}>{place.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="description"
                                label="Descrição do Evento em Português"
                                rules={[{ required: true, message: "Please enter the description" }]}
                            >
                                <Input.TextArea />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="description_en"
                                label="Descrição do Evento em Inglês"
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
