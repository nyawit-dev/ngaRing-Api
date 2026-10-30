import React, { useEffect, useState, useRef } from 'react';
import { IconBolt, IconDownload, IconCheck, IconRotateClockwise } from '@tabler/icons';
import toast from 'react-hot-toast';
import StyledWrapper from './StyledWrapper';
import UpdateModal from './UpdateModal';

const UpdateNotification = () => {
  const [updateState, setUpdateState] = useState({
    status: 'idle',
    currentVersion: '',
    availableVersion: null,
    releaseNotes: null,
    progress: null,
    error: null
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('install'); // 'download' | 'install'
  const isManualCheckRef = useRef(false);

  useEffect(() => {
    const { ipcRenderer } = window;
    if (!ipcRenderer) return;

    // Fetch initial status
    ipcRenderer.invoke('updater:get-status')
      .then((state) => {
        if (state) {
          setUpdateState(state);
          if (state.status === 'downloaded') {
            setModalMode('install');
            setShowModal(true);
          } else if (state.status === 'available') {
            setModalMode('download');
            setShowModal(true);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to get updater status:', err);
      });

    // Subscribe to status updates from main process
    const removeListener = ipcRenderer.on('main:updater-status', (state) => {
      if (!state) return;
      setUpdateState(state);

      if (state.status === 'checking') {
        if (isManualCheckRef.current) {
          toast.loading('Memeriksa pembaruan ke GitHub Releases...', { id: 'manual-update-toast' });
        }
      } else if (state.status === 'not-available') {
        if (isManualCheckRef.current) {
          toast.success(`NgaRingApi v${state.availableVersion || state.currentVersion} sudah versi terbaru.`, {
            id: 'manual-update-toast',
            duration: 4000
          });
          isManualCheckRef.current = false;
        }
      } else if (state.status === 'available') {
        if (isManualCheckRef.current) {
          toast.dismiss('manual-update-toast');
          isManualCheckRef.current = false;
        }
        // User decision gate: Prompt before downloading
        setModalMode('download');
        setShowModal(true);
      } else if (state.status === 'downloaded') {
        if (isManualCheckRef.current) {
          toast.dismiss('manual-update-toast');
          isManualCheckRef.current = false;
        }
        // Auto-prompt to install immediately after download completes
        setModalMode('install');
        setShowModal(true);
        toast.success(`Pembaruan v${state.availableVersion} berhasil diunduh dan siap dipasang!`, { duration: 5000 });
      } else if (state.status === 'error') {
        if (isManualCheckRef.current) {
          toast.error(`Pemeriksaan pembaruan gagal: ${state.error || 'Koneksi error'}`, {
            id: 'manual-update-toast',
            duration: 5000
          });
          isManualCheckRef.current = false;
        }
      }
    });

    return () => {
      if (typeof removeListener === 'function') {
        removeListener();
      }
    };
  }, []);

  const handleStartDownload = () => {
    setShowModal(false);
    const { ipcRenderer } = window;
    if (ipcRenderer) {
      toast('Memulai pengunduhan pembaruan...', { icon: '📥', duration: 3000 });
      ipcRenderer.invoke('updater:start-download').catch((err) => {
        console.error('Start download error:', err);
        toast.error(`Gagal mengunduh pembaruan: ${err?.message || 'Error'}`);
      });
    }
  };

  const handleInstall = () => {
    setShowModal(false);
    const { ipcRenderer } = window;
    if (ipcRenderer) {
      toast.loading('Memasang pembaruan & memuat ulang...');
      ipcRenderer.invoke('updater:quit-and-install');
    }
  };

  const handleCheckUpdate = (e) => {
    e?.stopPropagation?.();
    const { ipcRenderer } = window;
    if (!ipcRenderer) return;

    isManualCheckRef.current = true;
    toast.loading('Memeriksa pembaruan ke GitHub Releases...', { id: 'manual-update-toast' });
    ipcRenderer.invoke('updater:check-for-updates')
      .catch((err) => {
        console.error('Check for updates error:', err);
        toast.error(`Gagal memeriksa pembaruan: ${err?.message || 'Error'}`, { id: 'manual-update-toast' });
        isManualCheckRef.current = false;
      });
  };

  const { status, availableVersion, progress, releaseNotes } = updateState;

  // Active Download Progress UI
  if (status === 'downloading') {
    const percent = progress?.percent || 0;
    const transferredMB = progress?.transferred ? (progress.transferred / (1024 * 1024)).toFixed(1) : null;
    const totalMB = progress?.total ? (progress.total / (1024 * 1024)).toFixed(1) : null;
    const tooltipText = totalMB ? `${transferredMB} MB dari ${totalMB} MB (${percent}%)` : `Mengunduh... ${percent}%`;

    return (
      <StyledWrapper>
        <div
          className="update-chip downloading"
          title={tooltipText}
        >
          <span className="pulse-dot-cyan" />
          <span className="chip-label">Unduh v{availableVersion || ''}</span>
          <span className="percent-text">{percent}%</span>
          <div className="update-progress-bar">
            <div className="fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </StyledWrapper>
    );
  }

  // Download Complete - Ready to Install UI
  if (status === 'downloaded') {
    return (
      <StyledWrapper>
        {showModal && (
          <UpdateModal
            version={availableVersion}
            mode="install"
            onClose={() => setShowModal(false)}
            onConfirm={handleInstall}
          />
        )}
        <div
          className="update-chip ready"
          onClick={() => {
            setModalMode('install');
            setShowModal(true);
          }}
          title="Pembaruan siap dipasang. Klik untuk menerapkan sekarang!"
        >
          <IconBolt size={14} />
          <span>Pasang v{availableVersion}</span>
        </div>
      </StyledWrapper>
    );
  }

  // Update Available (Pending User Decision) UI
  if (status === 'available') {
    return (
      <StyledWrapper>
        {showModal && (
          <UpdateModal
            version={availableVersion}
            mode="download"
            releaseNotes={releaseNotes}
            onClose={() => setShowModal(false)}
            onConfirm={handleStartDownload}
          />
        )}
        <div
          className="update-chip available"
          onClick={() => {
            setModalMode('download');
            setShowModal(true);
          }}
          title="Versi baru tersedia! Klik untuk melihat dan mengunduh."
        >
          <span className="pulse-dot-amber" />
          <span>Update v{availableVersion} Tersedia</span>
        </div>
      </StyledWrapper>
    );
  }

  // Checking Status UI (Pulse Dot - No Spinning Icon)
  if (status === 'checking') {
    return (
      <StyledWrapper>
        <div className="update-chip checking" title="Sedang memeriksa versi terbaru di GitHub Releases...">
          <span className="pulse-dot-amber" />
          <span>Memeriksa Versi...</span>
        </div>
      </StyledWrapper>
    );
  }

  // Default: Check Update Button
  return (
    <StyledWrapper>
      <div
        className="update-chip check-btn"
        onClick={handleCheckUpdate}
        title="Periksa Pembaruan Aplikasi (Check for Updates)"
        role="button"
        tabIndex={0}
      >
        <IconRotateClockwise size={12} strokeWidth={2} />
        <span>Check Update</span>
      </div>
    </StyledWrapper>
  );
};

export default UpdateNotification;
