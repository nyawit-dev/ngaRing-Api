import React, { useEffect, useState, useRef } from 'react';
import { IconDownload, IconRotateClockwise, IconBolt } from '@tabler/icons';
import toast from 'react-hot-toast';
import StyledWrapper from './StyledWrapper';
import UpdateModal from './UpdateModal';

const UpdateNotification = () => {
  const [updateState, setUpdateState] = useState({
    status: 'idle',
    currentVersion: '',
    availableVersion: null,
    progress: null,
    error: null
  });
  const [showModal, setShowModal] = useState(false);
  const toastIdRef = useRef(null);

  useEffect(() => {
    const { ipcRenderer } = window;
    if (!ipcRenderer) return;

    // Fetch initial status
    ipcRenderer.invoke('updater:get-status')
      .then((state) => {
        if (state) setUpdateState(state);
      })
      .catch((err) => {
        console.error('Failed to get updater status:', err);
      });

    // Subscribe to status updates from main process
    const removeListener = ipcRenderer.on('main:updater-status', (state) => {
      if (!state) return;
      setUpdateState(state);

      if (state.status === 'checking') {
        if (toastIdRef.current) {
          toast.loading('Memeriksa pembaruan aplikasi...', { id: toastIdRef.current });
        }
      } else if (state.status === 'not-available') {
        if (toastIdRef.current) {
          toast.success(`NgaRingApi v${state.availableVersion || state.currentVersion} sudah versi terbaru.`, {
            id: toastIdRef.current
          });
          toastIdRef.current = null;
        }
      } else if (state.status === 'available') {
        toast('Pembaruan baru v' + state.availableVersion + ' ditemukan! Mengunduh di latar belakang...', {
          icon: '⚡',
          duration: 4000
        });
      } else if (state.status === 'downloaded') {
        toast.success(`Pembaruan v${state.availableVersion} siap dipasang!`, { duration: 5000 });
      } else if (state.status === 'error') {
        if (toastIdRef.current) {
          toast.error(`Gagal memeriksa pembaruan: ${state.error || 'Koneksi error'}`, {
            id: toastIdRef.current
          });
          toastIdRef.current = null;
        }
      }
    });

    return () => {
      if (typeof removeListener === 'function') {
        removeListener();
      }
    };
  }, []);

  const handleInstall = () => {
    const { ipcRenderer } = window;
    if (ipcRenderer) {
      ipcRenderer.invoke('updater:quit-and-install');
    }
  };

  const handleCheckUpdate = (e) => {
    e?.stopPropagation?.();
    const { ipcRenderer } = window;
    if (!ipcRenderer) return;

    toastIdRef.current = toast.loading('Memeriksa pembaruan ke GitHub Releases...');
    ipcRenderer.invoke('updater:check-for-updates')
      .catch((err) => {
        console.error('Check for updates error:', err);
        toast.error(`Gagal memeriksa pembaruan: ${err?.message || 'Error'}`, { id: toastIdRef.current });
        toastIdRef.current = null;
      });
  };

  const { status, availableVersion, progress } = updateState;

  if (status === 'downloading') {
    const percent = progress?.percent || 0;
    return (
      <StyledWrapper>
        <div
          className="update-chip downloading"
          title={`Mengunduh pembaruan v${availableVersion || ''} (${percent}%)`}
        >
          <IconDownload size={14} className="spinner" />
          <span>v{availableVersion || ''} ({percent}%)</span>
          <div className="update-progress-bar">
            <div className="fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </StyledWrapper>
    );
  }

  if (status === 'downloaded') {
    return (
      <StyledWrapper>
        {showModal && (
          <UpdateModal
            version={availableVersion}
            onClose={() => setShowModal(false)}
            onInstall={handleInstall}
          />
        )}
        <div
          className="update-chip ready"
          onClick={() => setShowModal(true)}
          title="Klik untuk menerapkan pembaruan sekarang"
        >
          <IconBolt size={14} />
          <span>Update v{availableVersion} Siap</span>
        </div>
      </StyledWrapper>
    );
  }

  if (status === 'checking') {
    return (
      <StyledWrapper>
        <div className="update-chip checking" title="Sedang memeriksa pembaruan...">
          <IconRotateClockwise size={13} className="spinner" />
          <span>Memeriksa...</span>
        </div>
      </StyledWrapper>
    );
  }

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
