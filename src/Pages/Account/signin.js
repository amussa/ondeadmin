// src/Login.js
import axios from 'axios';
import 'antd/dist/reset.css';
import React from 'react';
import { Form, Input, Button, notification } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { CSSTransition } from 'react-transition-group';
import { useMutation } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { firebase } from '../../base'
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate()

  const submit = (details) => {
    if (details.username === "" || details.password === "") {
      notification.error({
        message: 'Error',
        description: 'Fill in all fields'
      })
    } else {
      firebase
        .auth()
        .signInWithEmailAndPassword(details.username, details.password)
        .then((userCredential) => {
          // Signed in 
          localStorage.setItem('username', details.username)
          notification.success({
            message: 'Success',
            description: 'Login Successful'
          })
          navigate('/')
          const uid = userCredential.user.uid;

          // Get the admin object with the uid
          firebase.firestore().collection('administrador').where('uid', '==', uid).get()
            .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                localStorage.setItem('user', JSON.stringify(doc.data()))
              });
            }).catch((error) => {
              console.log("Error getting documents: ", error);
            });
        })
        .catch((error) => {
          notification.error({
            message: 'Error',
            description: 'Login Failed'
          })
        });
    }
  };


  const handleSubmit = async (e) => {
    submit(e)
  };

  return (
    <CSSTransition in={true} appear={true} timeout={300} classNames="fade">
      <div className="flex h-screen bg-blue-50">
        <div className="m-auto">
          <Form
            name="basic"
            initialValues={{ remember: true }}
            onFinish={handleSubmit}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-80"
          >
            <img src={require('../../assets/logo/logo_purple.png')} alt="logo" className="w-40 mx-auto mb-4" />
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Introduza o seu Nome de Usuário!' }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Introduza a sua senha!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Button className='bg-purple-900 text-white' htmlType="submit" block>
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </CSSTransition>
  );
};

export default Login;
