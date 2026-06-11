import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useRecordsStore } from '../../store/useRecordsStore';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import RecordFormModal from '../record/RecordFormModal';

/** AppLayout 组件属性接口 */
export interface AppLayoutProps {
  /** 自定义类名 */
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ className }) => {
  const openNewForm = useRecordsStore((s) => s.openNewForm);

  return (
    <div className={cn('min-h-screen bg-cream/50', className)}>
      <Sidebar onNewRecord={openNewForm} />
      <div className="md:pl-60 min-h-screen flex flex-col">
        <Topbar onNewRecord={openNewForm} />
        <main className="flex-1">
          <div
            className={cn(
              'p-4 md:p-8',
              'pb-24 md:pb-8',
              'max-w-7xl mx-auto w-full',
            )}
          >
            <Outlet />
          </div>
        </main>
      </div>
      <RecordFormModal />
    </div>
  );
};

AppLayout.displayName = 'AppLayout';

export default AppLayout;
