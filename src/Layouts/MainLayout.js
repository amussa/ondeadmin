import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layout, Space, Popconfirm } from 'antd';
import {
  StockOutlined,
  UserOutlined,
  SettingOutlined,
  HomeOutlined,
  CalendarOutlined,
  FileOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { firebase } from '../base'
import { useLocation } from 'react-router-dom';
const { Header, Sider, Content, Footer } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [see, setSee] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    setSee(false);
    setCheckingAuth(true);
    
    firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        // Não está logado
        navigate('/account/login');
        setCheckingAuth(false);
      } else {
        // Está logado - AGORA VAMOS VERIFICAR SE É ADMIN
        try {
          const adminSnapshot = await firebase.firestore()
            .collection('administrador')
            .where('uid', '==', user.uid)
            .get();
          
          if (adminSnapshot.empty) {
            // NÃO É ADMIN - BLOQUEAR ACESSO!
            console.error('Acesso negado: Usuário não é administrador');
            alert('Acesso negado! Você não tem permissões de administrador.');
            
            // Fazer logout e redirecionar
            await firebase.auth().signOut();
            navigate('/account/login');
            setSee(false);
          } else {
            // É ADMIN - PERMITIR ACESSO
            const adminData = adminSnapshot.docs[0].data();
            localStorage.setItem('user', JSON.stringify(adminData));
            setSee(true);
            setIsAdmin(true);
          }
        } catch (error) {
          console.error('Erro ao verificar permissões:', error);
          await firebase.auth().signOut();
          navigate('/account/login');
        } finally {
          setCheckingAuth(false);
        }
      }
    });
  }, [navigate]);

  const [dialog, setDialog] = useState(false);

  const handleLogout = () => {
    firebase.auth().signOut().then(() => {
      localStorage.removeItem('user');
      localStorage.removeItem('username');
      setDialog(false);
      navigate('/account/login');
    }).catch((error) => {
      console.log(error);
    });
  }

  const [selectedOption, setSelectedOption] = useState(0);

  // Mostrar loading enquanto verifica autenticação
  if (checkingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <img src={require('../assets/logo/logo_purple.png')} style={{ width: '100px' }} alt="Logo" />
        </div>
        <p>Verificando permissões...</p>
      </div>
    );
  }

  return (
    <>
      {see && isAdmin ?
        <Layout style={{ minHeight: '100vh' }}>
          <Layout>
            <div className='flex flex-col gap-2'>
              <div className='ml-4 mr-4 mt-1 gap-1' style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className='flex flex-row gap-2 items-center'>
                  <img src={require('../assets/logo/logo_purple.png')} style={{ width: '50px' }} />
                  <p className='text-purple-900 text-xl font-bold' style={{ margin: 0 }}>ADMIN</p>
                </div>
                <Popconfirm
                  visible={dialog}
                  title="Deseja sair da conta?"
                  onConfirm={handleLogout}
                  onCancel={() => setDialog(false)}
                  okText="Sim"
                  cancelText="Não"
                  okButtonProps={{ className: 'bg-blue-500 hover:bg-blue-600' }}
                >
                  <div onClick={() => setDialog(true)} className="flex items-center text-blue-900 cursor-pointer hover:text-blue-700 gap-2">
                    <UserOutlined className='text-purple-900' />
                    <span className='text-purple-900 font-bold'>{firebase.auth().currentUser?.email}</span>
                  </div>
                </Popconfirm>

              </div>
              <div className=" w-full justify-center flex gap-5 px-2 py-1 font-sans" style={{backgroundColor:'#A617A6'}}>
                <div
                  className={`hover:bg-purple-800 cursor-pointer hover:shadow-lg px-2 py-3 flex flex-col items-center gap-2 rounded-md ${location.pathname === '/' ? 'bg-purple-900 text-white' : 'text-gray-400'}`}
                  onClick={() => { setSelectedOption(0); navigate('/') }}
                >
                  <HomeOutlined />
                  <span>Home</span>
                </div>
                <div
                  className={`hover:bg-purple-800 cursor-pointer px-2 py-3 flex flex-col items-center gap-2 rounded-md ${location.pathname.includes('/eventos') ? 'bg-purple-900 text-white' : 'text-gray-400'}`}
                  onClick={() => { setSelectedOption(1); navigate('/eventos') }}
                >
                  <CalendarOutlined />
                  <span>Eventos</span>
                </div>
                <div
                  className={`hover:bg-purple-800 cursor-pointer px-2 py-3 flex flex-col items-center gap-2 rounded-md ${location.pathname.includes('/locais') ? 'bg-purple-900 text-white' : 'text-gray-400'}`}
                  onClick={() => { setSelectedOption(1); navigate('/locais') }}
                >
                  <EnvironmentOutlined />
                  <span>Locais</span>
                </div>
                <div
                  className={`hover:bg-purple-800 cursor-pointer px-2 py-3 flex flex-col items-center gap-2 rounded-md ${location.pathname.includes('/bilhetes') ? 'bg-purple-900 text-white' : 'text-gray-400'}`}
                  onClick={() => { setSelectedOption(2); }}
                >
                  <FileOutlined />
                  <span>Bilhetes</span>
                </div>
                <div
                  className={`hover:bg-purple-800 cursor-pointer px-2 py-3 flex flex-col items-center gap-2 rounded-md ${location.pathname.includes('/financas') ? 'bg-purple-900 text-white' : 'text-gray-400'}`}
                  onClick={() => { setSelectedOption(4) }}
                >
                  <StockOutlined />
                  <span>Finanças</span>
                </div>
                <div
                  className={`hover:bg-purple-800 cursor-pointer px-2 py-3 flex flex-col items-center gap-2 rounded-md ${location.pathname.includes('/config') ? 'bg-purple-900 text-white' : 'text-gray-400'}`}
                  onClick={() => setSelectedOption(5)}
                >
                  <SettingOutlined />
                  <span>Configurações</span>
                </div>
              </div>
            </div>

            <Content className="p-4">
              <Outlet />
            </Content>
          </Layout>
        </Layout>
        : null}
    </>
  );
}

export default MainLayout;
