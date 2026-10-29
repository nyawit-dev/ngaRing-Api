import React from 'react';
import Modal from 'components/Modal';
import { IconBolt, IconCheck, IconRefresh } from '@tabler/icons';

const UpdateModal = ({ onClose, onInstall, version }) => {
  return (
    <Modal
      size="sm"
      title="Pembaruan Aplikasi Siap"
      confirmText="Restart & Terapkan"
      cancelText="Nanti Saja"
      handleConfirm={onInstall}
      handleCancel={onClose}
      confirmButtonColor="primary"
    >
      <div className="flex flex-col gap-3 py-2 text-sm text-slate-300">
        <div className="flex items-center gap-2 font-medium text-slate-100">
          <IconBolt size={18} className="text-cyan-400" />
          <span>NgaRingApi v{version || 'Terbaru'}</span>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          Pembaruan versi terbaru telah berhasil diunduh di latar belakang. Aplikasi akan menutup sejenak dan membuka kembali dengan versi terbaru.
        </p>

        <div className="flex items-center gap-2 p-2 rounded bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <IconCheck size={16} className="text-emerald-400 shrink-0" />
          <span>Seluruh tab, workspace, dan perubahan Anda tetap aman.</span>
        </div>
      </div>
    </Modal>
  );
};

export default UpdateModal;
