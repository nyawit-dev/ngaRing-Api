import React from 'react';
import styled from 'styled-components';
import Modal from 'components/Modal';
import { IconBolt, IconCheck, IconDownload, IconAlertCircle, IconExternalLink, IconInfoCircle } from '@tabler/icons';
import DOMPurify from 'dompurify';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true
});

const ReleaseNotesWrapper = styled.div`
  font-size: 11px;
  line-height: 1.6;
  color: #cbd5e1;

  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    color: #f1f5f9;
    margin-top: 8px;
    margin-bottom: 4px;
    line-height: 1.35;
  }

  h1, h2, h3, h4 {
    font-size: 12px;
    color: #38bdf8;
    border-bottom: 1px solid rgba(56, 189, 248, 0.2);
    padding-bottom: 2px;
  }

  p {
    margin-top: 4px;
    margin-bottom: 6px;
    color: #94a3b8;
  }

  ul, ol {
    margin: 4px 0 8px 16px;
    padding: 0;
    list-style-type: disc;
  }

  li {
    margin-top: 2px;
    margin-bottom: 2px;
    color: #cbd5e1;
  }

  strong {
    color: #f8fafc;
    font-weight: 600;
  }

  code {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(51, 65, 85, 0.7);
    color: #7dd3fc;
    padding: 1px 4px;
    border-radius: 3px;
    font-family: monospace;
    font-size: 10px;
  }

  a {
    color: #38bdf8;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
      color: #7dd3fc;
    }
  }
`;

const getSanitizedReleaseNotesHtml = (notes) => {
  if (!notes) return '';
  let rawText = '';
  if (Array.isArray(notes)) {
    rawText = notes.map((item) => (typeof item === 'string' ? item : item?.note || '')).join('\n\n');
  } else if (typeof notes === 'string') {
    rawText = notes;
  } else {
    rawText = String(notes);
  }

  // GitHub releases atom feed provides full HTML (starts with <h1, <h2, <h3, <h4, <p, etc.)
  const isHtml = /<\/?(h[1-6]|p|ul|ol|li|div|span|strong|em|code|a|br)[\s>]/i.test(rawText);
  const htmlToSanitize = isHtml ? rawText : md.render(rawText);

  return DOMPurify.sanitize(htmlToSanitize, {
    ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'code', 'pre', 'a', 'br', 'span', 'hr'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'title']
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

  const handleOpenBrowser = (targetUrl) => {
    const { ipcRenderer } = window;
    const url = typeof targetUrl === 'string' ? targetUrl : version;
    if (ipcRenderer) {
      ipcRenderer.invoke('updater:open-download-page', url);
    } else {
      window.open(typeof targetUrl === 'string' ? targetUrl : `https://github.com/nyawit-dev/ngaRing-Api/releases/tag/v${version || ''}`, '_blank');
    }
  };

  const handleNotesClick = (e) => {
    const link = e.target.closest('a');
    if (link && link.href) {
      e.preventDefault();
      handleOpenBrowser(link.href);
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

  const releaseNotesHtml = getSanitizedReleaseNotesHtml(releaseNotes);

  const getErrorMessage = () => {
    if (!error) return 'Koneksi ke server rilis terganggu.';
    if (error.includes('checksum mismatch')) {
      return 'Terdapat perbedaan checksum berkas (proses unggah rilis baru sedang berlangsung di server GitHub). Silakan coba lagi beberapa saat lagi atau unduh installer resmi secara manual.';
    }
    if (error.includes('digitally signed') || error.includes('signature')) {
      return 'Sertifikat digital untuk build komunitas Windows sedang disesuaikan. Silakan gunakan installer manual via browser.';
    }
    return error;
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
            onClick={() => handleOpenBrowser()}
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
                ? `Terjadi kendala saat memeriksa atau mengunduh pembaruan: ${getErrorMessage()}`
                : isDownload
                ? 'Versi terbaru NgaRingApi telah tersedia dengan peningkatan performa, perbaikan bug, dan fitur terkini. Apakah Anda ingin mengunduh pembaruan ini sekarang?'
                : 'Pembaruan versi terbaru telah selesai diunduh 100%. Aplikasi akan menutup sejenak dan membuka kembali dengan versi terbaru.'}
            </p>

            {/* Release Notes Card */}
            {releaseNotesHtml && !isError && (
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 max-h-44 overflow-y-auto">
                <span className="font-semibold block mb-1 text-slate-200">Catatan Pembaruan:</span>
                <ReleaseNotesWrapper
                  onClick={handleNotesClick}
                  dangerouslySetInnerHTML={{ __html: releaseNotesHtml }}
                />
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
