import React from 'react';
import Modal from 'components/Modal';
import { IconBolt, IconCheck, IconDownload, IconAlertCircle, IconExternalLink } from '@tabler/icons';

const formatReleaseNotes = (notes) => {
  if (!notes) return null;
  if (typeof notes !== 'string') return notes;

  // Format markdown-like headings and bullets cleanly
  const lines = notes.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} className="h-1.5" />;

    if (trimmed.startsWith('###') || trimmed.startsWith('####')) {
      const title = trimmed.replace(/^#+\s*/, '');
      return (
        <div key={idx} className="font-semibold text-xs text-slate-200 mt-2 mb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
          <span>{title}</span>
        </div>
      );
    }

    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const item = trimmed.replace(/^[-*]\s*/, '');
      return (
        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300 ml-2 my-0.5 leading-relaxed">
          <span className="text-cyan-400 select-none">•</span>
          <span>{item}</span>
        </div>
      );
    }

    return (
      <p key={idx} className="text-[11px] text-slate-400 my-0.5 leading-relaxed">
        {trimmed}
      </p>
    );
  });
};

const UpdateModal = ({
  onClose,
  onConfirm,
  version,
  mode = 'install', // 'download' | 'install' | 'error'
  releaseNotes,
  error
}) => {
  const isDownload = mode === 'download';
  const isError = mode === 'error';

  const handleOpenBrowser = () => {
    const { ipcRenderer } = window;
    if (ipcRenderer) {
      ipcRenderer.invoke('updater:open-download-page', version);
    }
  };

  const getTitle = () => {
    if (isError) return 'Kendala Pembaruan Aplikasi';
    if (isDownload) return 'Pembaruan Aplikasi Tersedia';
    return 'Pembaruan Siap Dipasang';
  };

  const getConfirmText = () => {
    if (isError) return 'Unduh Manual via Browser';
    if (isDownload) return 'Unduh & Perbarui Sekarang';
    return 'Restart & Pasang Sekarang';
  };

  const getCancelText = () => {
    if (isError) return 'Tutup';
    if (isDownload) return 'Nanti Saja';
    return 'Pasang Saat Aplikasi Ditutup';
  };

  const handleMainConfirm = () => {
    if (isError) {
      handleOpenBrowser();
      onClose();
    } else {
      onConfirm();
    }
  };

  return (
    <Modal
      size="sm"
      title={getTitle()}
      confirmText={getConfirmText()}
      cancelText={getCancelText()}
      handleConfirm={handleMainConfirm}
      handleCancel={onClose}
      confirmButtonColor={isError ? 'secondary' : 'primary'}
    >
      <div className="flex flex-col gap-3 py-2 text-sm text-slate-300">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-slate-100">
            {isError ? (
              <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
                <IconAlertCircle size={18} />
              </div>
            ) : isDownload ? (
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

          <button
            type="button"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
            onClick={handleOpenBrowser}
            title="Buka rilis lengkap di GitHub Releases"
          >
            <span>GitHub Release</span>
            <IconExternalLink size={12} />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed text-slate-400">
          {isError
            ? `Terjadi kendala saat memeriksa atau mengunduh pembaruan (${error || 'Koneksi terganggu'}). Anda tetap dapat mengunduh installer resmi terbaru secara manual melalui GitHub Releases.`
            : isDownload
            ? 'Versi terbaru NgaRingApi telah tersedia dengan peningkatan performa, perbaikan bug, dan fitur terkini. Apakah Anda ingin mengunduh pembaruan ini sekarang?'
            : 'Pembaruan versi terbaru telah selesai diunduh 100%. Aplikasi akan menutup sejenak dan membuka kembali dengan versi terbaru.'}
        </p>

        {/* Release Notes Card */}
        {releaseNotes && !isError && (
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 max-h-44 overflow-y-auto">
            <span className="font-semibold block mb-1 text-slate-200">Catatan Pembaruan:</span>
            {formatReleaseNotes(releaseNotes)}
          </div>
        )}

        {/* Safety Callout */}
        <div className="flex items-center gap-2 p-2 rounded bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <IconCheck size={16} className="text-emerald-400 shrink-0" />
          <span>Seluruh tab, workspace, dan koleksi Anda tetap tersimpan aman.</span>
        </div>
      </div>
    </Modal>
  );
};

export default UpdateModal;
