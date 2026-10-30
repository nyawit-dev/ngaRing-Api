import React, { useEffect, useState, useRef } from 'react';
import { IconBolt, IconRotateClockwise } from '@tabler/icons';
import toast from 'react-hot-toast';
import { useApp } from 'providers/App';
import StyledWrapper from './StyledWrapper';
import UpdateModal from './UpdateModal';

const UpdateNotification = () => {
  const { version } = useApp();
  const [updateState, setUpdateState] = useState({
    status: 'idle',
    currentVersion: '',
    availableVersion: null,
    releaseNotes: null,
    progress: null,
    error: null
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('install'); // 'download' | 'downloading' | 'install' | 'error'
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
          } else if (state.status === 'downloading') {
            setModalMode('downloading');
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
      } else if (state.status === 'downloading') {
        setModalMode('downloading');
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
        setModalMode('error');
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
    // Keep modal open in downloading mode so progress is displayed in dialog
    setModalMode('downloading');
    setShowModal(true);
    const { ipcRenderer } = window;
    if (ipcRenderer) {
      ipcRenderer.invoke('updater:start-download').catch((err) => {
        console.error('Start download error:', err);
        setModalMode('error');
        setShowModal(true);
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

  const { status, availableVersion, progress, releaseNotes, error } = updateState;
  const displayVersion = updateState.currentVersion || version;

  return (
    <StyledWrapper>
      {showModal && (
        <UpdateModal
          version={availableVersion}
          mode={modalMode}
          progress={progress}
          releaseNotes={releaseNotes}
          error={error}
          onClose={() => setShowModal(false)}
          onConfirm={modalMode === 'download' ? handleStartDownload : handleInstall}
        />
      )}

      {/* Status Bar Chip */}
      {status === 'downloading' ? (
        <div
          className="update-chip downloading cursor-pointer"
          onClick={() => {
            setModalMode('downloading');
            setShowModal(true);
          }}
          title="Klik untuk membuka dialog proses unduhan"
          role="button"
          tabIndex={0}
        >
          <span className="pulse-dot-cyan" />
          <span className="chip-label">Unduh v{availableVersion || ''} ({progress?.percent ?? 0}%)</span>
        </div>
      ) : status === 'downloaded' ? (
        <div
          className="update-chip ready"
          onClick={() => {
            setModalMode('install');
            setShowModal(true);
          }}
          title="Pembaruan siap dipasang. Klik untuk menerapkan sekarang!"
          role="button"
          tabIndex={0}
        >
          <IconBolt size={14} />
          <span>Pasang v{availableVersion}</span>
        </div>
      ) : status === 'available' ? (
        <div
          className="update-chip available"
          onClick={() => {
            setModalMode('download');
            setShowModal(true);
          }}
          title="Versi baru tersedia! Klik untuk melihat dan mengunduh."
          role="button"
          tabIndex={0}
        >
          <span className="pulse-dot-amber" />
          <span>Update v{availableVersion} Tersedia</span>
        </div>
      ) : status === 'checking' ? (
        <div className="update-chip checking" title="Sedang memeriksa versi terbaru di GitHub Releases...">
          <span className="pulse-dot-amber" />
          <span>Memeriksa Versi...</span>
        </div>
      ) : (
        <div
          className="update-chip check-btn"
          onClick={handleCheckUpdate}
          title="Klik untuk periksa pembaruan aplikasi (Check for Updates)"
          role="button"
          tabIndex={0}
          aria-label="Periksa Pembaruan Aplikasi"
        >
          <IconRotateClockwise size={12} strokeWidth={1.8} className="version-refresh-icon" aria-hidden="true" />
          <span className="font-medium">v{displayVersion}</span>
        </div>
      )}
    </StyledWrapper>
  );
};

export default UpdateNotification;
