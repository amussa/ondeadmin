import React, { useState, useEffect } from 'react';
import { ArrowDownOutlined, ArrowUpOutlined, User } from '@ant-design/icons';
import { Card, Col, Row, Statistic, Divider } from 'antd';
import { QuestionCircleOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';

const Home = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex-col">
        <div className="w-full bg-white pt-5 pb-5 rounded-md">
          <div className="w-full text-center">
            <div className="text-lg font-bold mb-2">Bem-vindo ao Painel de Administração</div>
            <div className="text-sm font-bold">
              {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).Nome : ''}
            </div>
            <div className="text-4xl font-bold">
              {time.toLocaleTimeString('pt-PT')}
            </div>
            <div className="text-gray-500">
              {time.toLocaleDateString('pt-PT')}
            </div>
          </div>
        </div>
        <Card className="w-full mt-5">
          <div className="text-center">
            <div className="text-lg font-bold mb-2">Suporte Técnico</div>
            <Divider />
            <div className="text-gray-500 mb-2">
              Em caso de dúvidas ou problemas, entre em contato conosco:
            </div>
            <div className="text-gray-500 mb-2 align-center">
              <span className="font-bold">
                <MailOutlined className="mr-2" />
                E-mail:
              </span>{' '}
              nazariowizz@gmail.com
            </div>
            <div className="text-gray-500 mb-4">
              <span className="font-bold">
                <PhoneOutlined className="mr-2" />
                Telefone:
              </span>{' '}
              (+258) 82-850-6206
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Home;