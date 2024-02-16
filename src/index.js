import React from 'react';
import ReactDOM from 'react-dom/client';
import {QueryClient, QueryClientProvider} from 'react-query';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from './Layouts/MainLayout';
import About from './Pages/About';
import Home from './Pages/Home';
import Us from './Pages/Us';
import Login from './Pages/Account/signin';
import MenuStock from './Pages/stock';
import Products from './Pages/stock/products';
import Suppliers from './Pages/stock/suppliers';
import StockIn from './Pages/stock/stockIn';
import StockOut from './Pages/stock/stockOut';
import MenuTutoria from './Pages/eventos';
import Organizers from './Pages/eventos/Organizers';
import MenuAccess from './Pages/access';
import Docente from './Pages/access/docentes';
import Tutor from './Pages/access/tutores';
import Estudantes from './Pages/access/estudantes';
import MenuFinancas from './Pages/financas';
import DashboardFinancas from './Pages/financas/dashboard';
import Relatorio from './Pages/financas/relatorio';
import Gestao from './Pages/eventos/Gestao';
import Categoria from './Pages/eventos/Categoria';
import TypeEvent from './Pages/eventos/TipoEvento';
import MenuLocal from './Pages/local';
import GestaoLocal from './Pages/local/Gestao';
import CategoriaLocal from './Pages/local/Categoria';
import Servicos from './Pages/local/Services';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/us', element: <Us /> }
    ]
  },
  {
    path: '/account/login',
    element: <Login />
  },
  {
    path: '/stock',
    element: <MainLayout />,
    children: [
      { path: '/stock', element: <MenuStock /> },
      { path: '/stock/products', element: <Products /> },
      { path: '/stock/suppliers', element: <Suppliers /> },
      { path: '/stock/stock-in', element: <StockIn /> },
      { path: '/stock/stock-out', element: <StockOut /> },
    ]
  },
  {
    path: '/eventos',
    element: <MainLayout />,
    children: [
      { path: '/eventos', element: <MenuTutoria /> },
      { path: '/eventos/gestao', element: <Gestao /> },
      { path: '/eventos/organizer', element: <Organizers /> },
      { path: '/eventos/category', element: <Categoria /> },
      { path: '/eventos/type', element: <TypeEvent /> },
    ]
  },
  {
    path: '/locais',
    element: <MainLayout />,
    children: [
      { path: '/locais', element: <MenuLocal /> },
      { path: '/locais/gestao', element: <GestaoLocal /> },
      { path: '/locais/category', element: <CategoriaLocal /> },
      { path: '/locais/services', element: <Servicos /> },
    ]
  },
  {
    path: '/acessos',
    element: <MainLayout />,
    children: [
      { path: '/acessos', element: <MenuAccess /> },
      { path: '/acessos/docente', element: <Docente /> },
      { path: '/acessos/tutor', element: <Tutor /> },
      { path: '/acessos/estudante', element: <Estudantes /> },

    ]
  },
  {
    path: '/financas',
    element: <MainLayout />,
    children: [
      { path: '/financas', element: <MenuFinancas /> },
      { path: '/financas/dashboard', element: <DashboardFinancas /> },
      { path: '/financas/relatorio', element: <Relatorio /> },
    ]
  },
  {
    
  },

]);

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
