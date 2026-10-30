import React from 'react';
import Modal from 'components/Modal';
import { IconBolt, IconCheck, IconDownload, IconAlertCircle, IconExternalLink, IconInfoCircle } from '@tabler/icons';

const formatReleaseNotes = (notes) => {
  if (!notes) return null;
  if (typeof notes !== 'string') return notes;

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
  mode = 'install', // 'download' | 'downloading' | 'install' | 'error'
  progress,
  releaseNotes,
  error
}) => {
  const isDownload = mode === 'download';
  const isDownloading = mode === 'downloading';
  const isError = mode === 'error';

  const handleOpenBrowser = () => {
    const { ipcRenderer } = window;
    if (ipcRenderer) {
      ipcRenderer.invoke('updater:open-download-page', version);
    }
  };

  const getTitle = () => {
    if (isError) return 'Kendala Pembaruan Aplikasi';
    if (isDownloading) return 'Mengunduh Pembaruan Aplikasi';
    if (isDownload) return 'Pembaruan Aplikasi Tersedia';
    return 'Pembaruan Siap Dipasang';
  };

  const getConfirmText = () => {
    if (isError) return 'Unduh Manual via Browser';
    if (isDownloading) return 'Lanjut di Latar Belakang';
    if (isDownload) return 'Unduh & Perbarui Sekarang';
    return 'Restart & Pasang Sekarang';
  };

  const getCancelText = () => {
    if (isError) return 'Tutup';
    if (isDownloading) return 'Tutup';
    if (isDownload) return 'Nanti Saja';
    return 'Pasang Saat Aplikasi Ditutup';
  };

  const handleMainConfirm = () => {
    if (isError) {
      handleOpenBrowser();
      onClose();
    } else if (isDownloading) {
      onClose();
    } else {
      onConfirm();
    }
  };

  // Downloading progress calculations
  const percent = progress?.percent ?? 0;
  const transferredMB = progress?.transferred ? (progress.transferred / (1024 * 1024)).toFixed(1) : null;
  const totalMB = progress?.total ? (progress.total / (1024 * 1024)).toFixed(1) : null;
  const speedMB = progress?.bytesPerSecond ? (progress.bytesPerSecond / (1024 * 1024)).toFixed(1) : null;

  let etaText = '';
  if (progress?.bytesPerSecond > 0 && progress?.total > progress?.transferred) {
    const remainingSec = Math.round((progress.total - progress.transferred) / progress.bytesPerSecond);
    if (remainingSec > 60) {
      etaText = `${Math.ceil(remainingSec / 60)} menit tersisa`;
    } else {
      etaText = `${remainingSec} detik tersisa`;
    }
  }

  return (
    <Modal
      size="sm"
      title={getTitle()}
      confirmText={getConfirmText()}
      cancelText={getCancelText()}
      handleConfirm={handleMainConfirm}
      handleCancel={onClose}
      confirmButtonColor={isError ? 'secondary' : 'primary'}
      hideCancel={isDownloading}
    >
      <div className="flex flex-col gap-3.5 py-2 text-sm text-slate-300">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium text-slate-100">
            {isError ? (
              <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
                <IconAlertCircle size={18} />
              </div>
            ) : isDownloading ? (
              <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400">
                <IconDownload size={18} className="animate-bounce" />
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

        {/* Downloading UI Mode */}
        {isDownloading ? (
          <div className="flex flex-col gap-3 py-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">Mengunduh file instalasi...</span>
              <span className="text-xl font-bold text-cyan-400 font-mono">{percent}%</span>
            </div>

            {/* Smooth Large Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 border border-slate-700/80 overflow-hidden relative shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400 rounded-full transition-all duration-200 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-center text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">Ukuran</span>
                <span className="font-mono font-medium text-slate-200 text-[11px]">
                  {totalMB ? `${transferredMB} / ${totalMB} MB` : `${percent}%`}
                </span>
              </div>
              <div className="flex flex-col border-x border-slate-700/60 px-1">
                <span className="text-[10px] text-slate-400">Kecepatan</span>
                <span className="font-mono font-medium text-slate-200 text-[11px]">
                  {speedMB ? `${speedMB} MB/s` : '-'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">Estimasi</span>
                <span className="font-mono font-medium text-slate-200 text-[11px]">
                  {etaText || '-'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-md bg-slate-800/40 border border-slate-700/40 text-[11px] text-slate-400 leading-normal">
              <IconInfoCircle size={15} className="text-cyan-400 shrink-0" />
              <span>Anda dapat melanjutkan pekerjaan. Klik tombol di bawah untuk menjalankan unduhan di latar belakang.</span>
            </div>
          </div>
        ) : (
          /* Other Modes: Download prompt, Install prompt, or Error */
          <>
            <p className="text-xs leading-relaxed text-slate-400">
              {isError
                ? `Terjadi kendala saat mengunduh pembaruan (${error || 'Koneksi terganggu'}). Anda dapat mengunduh installer resmi terbaru secara langsung melalui GitHub Releases.`
                : isDownload
                ? 'Versi terbaru NgaRingApi telah tersedia dengan peningkatan performa, perbaikan bug, dan fitur terkini. Apakah Anda ingin mengunduh pembaruan ini sekarang?'
                : 'Pembaruan versi terbaru telah selesai diunduh 100%. Aplikasi akan menutup sejenak dan membuka kembali dengan versi terbaru.'}
            </p>

            {/* Release Notes Card */}
            {releaseNotes && !isError && (
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 max-h-40 overflow-y-auto">
                <span className="font-semibold block mb-1 text-slate-200">Catatan Pembaruan:</span>
                {formatReleaseNotes(releaseNotes)}
              </div>
            )}

            {/* Safety Callout */}
            <div className="flex items-center gap-2 p-2 rounded bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
              <IconCheck size={16} className="text-emerald-400 shrink-0" />
              <span>Seluruh tab, workspace, dan koleksi Anda tetap tersimpan aman.</span>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default UpdateModal;
