import * as React from 'react';
import { useRecordsStore } from '../../store/useRecordsStore';
import Modal from '../ui/Modal';
import RecordForm from './RecordForm';

/**
 * RecordFormModal 新增/编辑噪音记录表单弹窗
 * 从 store 读取 isFormModalOpen 和 editingRecordId 状态
 */
export const RecordFormModal: React.FC = () => {
  const isOpen = useRecordsStore((s) => s.isFormModalOpen);
  const editingRecordId = useRecordsStore((s) => s.editingRecordId);
  const records = useRecordsStore((s) => s.records);
  const closeForm = useRecordsStore((s) => s.closeForm);

  const editingRecord = editingRecordId
    ? records.find((r) => r.id === editingRecordId) || null
    : null;

  return (
    <Modal
      open={isOpen}
      onClose={closeForm}
      title={editingRecord ? '编辑噪音记录' : '新增噪音记录'}
      subtitle={editingRecord ? '修改已有的噪音干扰事件记录' : '记录一次噪音干扰事件'}
      size="xl"
    >
      <RecordForm
        editingRecord={editingRecord}
        onCancel={closeForm}
        onSuccess={closeForm}
      />
    </Modal>
  );
};

RecordFormModal.displayName = 'RecordFormModal';

export default RecordFormModal;
