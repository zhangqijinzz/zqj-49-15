import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import NoiseLog from '@/pages/NoiseLog';
import RecordDetail from '@/pages/RecordDetail';
import ExportReport from '@/pages/ExportReport';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'log',
        children: [
          {
            index: true,
            element: <NoiseLog />,
          },
          {
            path: ':id',
            element: <RecordDetail />,
          },
        ],
      },
      {
        path: 'export',
        element: <ExportReport />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

/**
 * App 根组件
 * 使用 React Router v7 的 createBrowserRouter / RouterProvider 配置路由
 */
export default function App() {
  return <RouterProvider router={router} />;
}
