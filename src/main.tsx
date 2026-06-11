import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { useRecordsStore } from './store/useRecordsStore';
import './index.css';

/**
 * 应用入口组件
 * - 首次渲染时从 localStorage 恢复 store 数据
 * - 挂载路由根组件
 */
function Root() {
  const hydrateFromStorage = useRecordsStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
