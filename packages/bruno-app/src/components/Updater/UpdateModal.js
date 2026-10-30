import React from 'react';
import Modal from 'components/Modal';
import { IconBolt, IconCheck, IconDownload } from '@tabler/icons';

const UpdateModal = ({ onClose, onConfirm, version, mode = 'install', releaseNotes }) => {
  const isDownload = mode === 'download';

  return (
    <Modal
      size="sm"
      title={isDownload ? 'Pembaruan Aplikasi Tersedia' : 'Pembaruan Siap Dipasang'}
      confirmText={isDownload ? 'Unduh Pembaruan' : 'Restart & Pasang Sekarang'}
      cancelText={isDownload ? 'Nanti Saja' : 'Pasang Saat Aplikasi Ditutup'}
      handleConfirm={onConfirm}
      handleCancel={onClose}
      confirmButtonColor="primary"
    >
      <div className="flex flex-col gap-3 py-2 text-sm text-slate-300">
        <div className="flex items-center gap-2 font-medium text-slate-100">
          {isDownload ? (
            <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400">
              <IconDownload size={18} />
            </div>
          ) : (
            <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400">
              <IconBolt size={18} />
            </div>
          )}
          <span className="font-semibold text-sm">NgaRingApi v{version || 'Terbaru'}</span>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          {isDownload
            ? 'Versi terbaru NgaRingApi telah tersedia dengan berbagai peningkatan performa dan perbaikan bug. Apakah Anda ingin mengunduh pembaruan ini sekarang?'
            : 'Pembaruan versi terbaru telah selesai diunduh di latar belakang. Aplikasi akan menutup sejenak dan membuka kembali dengan versi terbaru.'}
        </p>

        {releaseNotes && (
          <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 max-h-36 overflow-y-auto">
            <span className="font-semibold block mb-1 text-slate-200">Catatan Pembaruan:</span>
            <div className="whitespace-pre-wrap text-slate-400 text-[11px] leading-relaxed">{releaseNotes}</div>
          </div>
        )}

        <div className="flex items-center gap-2 p-2 rounded bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <IconCheck size={16} className="text-emerald-400 shrink-0" />
          <span>Seluruh tab, workspace, dan koleksi Anda tetap tersimpan aman.</span>
        </div>
      </div>
    </Modal>
  );
};

export default UpdateModal;
