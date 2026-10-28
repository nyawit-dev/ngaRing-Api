import React, { useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { IconBrandGit, IconLink } from '@tabler/icons';
import toast from 'react-hot-toast';
import Modal from 'components/Modal';
import { isGitRepositoryUrl } from 'utils/git';
import { connectCollectionToGit } from 'providers/ReduxStore/slices/workspaces/actions';

const ConnectGitRemote = ({ collectionPath, collectionName, initialUrl = '', onClose }) => {
  const dispatch = useDispatch();
  const inputRef = useRef();
  const activeWorkspaceUid = useSelector((state) => state.workspaces.activeWorkspaceUid);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      remoteUrl: initialUrl
    },
    validationSchema: Yup.object({
      remoteUrl: Yup.string()
        .trim()
        .required('Git remote URL is required')
        .test('is-git-url', 'Enter a valid Git URL', (value) => isGitRepositoryUrl(value))
    }),
    onSubmit: (values) => {
      dispatch(
        connectCollectionToGit({
          workspaceUid: activeWorkspaceUid,
          collectionPath,
          remoteUrl: values.remoteUrl.trim()
        })
      )
        .then(() => {
          toast.success('Git remote connected');
          onClose();
        })
        .catch(() => {
          // toast already handled in the thunk
        });
    }
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const title = initialUrl ? 'Update Git Remote' : 'Connect to Git';
  const confirmText = initialUrl ? 'Update' : 'Connect';

  return (
    <Modal size="md" title={title} confirmText={confirmText} handleConfirm={() => formik.handleSubmit()} handleCancel={onClose}>
      <form className="bruno-form w-full box-sizing: border-box" onSubmit={(e) => e.preventDefault()}>
        {collectionName ? (
          <div className="text-xs sm:text-sm text-muted mb-4 leading-relaxed break-words space-y-2 p-3 bg-gray-800/40 rounded border border-gray-700/50">
            <div className="flex items-center gap-2 font-semibold text-gray-200">
              <IconBrandGit size={18} className="text-yellow-500 flex-shrink-0" />
              <span className="truncate">{collectionName}</span>
            </div>
            <p className="m-0 text-gray-400 text-xs">
              Menghubungkan koleksi ini ke remote Git repository. URL akan disimpan di <span className="font-mono text-gray-300">workspace.yml</span>.
            </p>
          </div>
        ) : null}
        <div>
          <label htmlFor="remoteUrl" className="block text-xs font-semibold text-gray-300 mb-1">
            Git Remote URL
          </label>
          <div className="relative">
            <input
              id="remoteUrl"
              type="text"
              name="remoteUrl"
              ref={inputRef}
              className="block textbox w-full text-xs font-mono px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-yellow-500"
              placeholder="https://github.com/owner/repository.git"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              onChange={formik.handleChange}
              value={formik.values.remoteUrl || ''}
            />
          </div>
          {formik.touched.remoteUrl && formik.errors.remoteUrl ? (
            <div className="text-red-400 text-xs mt-1">{formik.errors.remoteUrl}</div>
          ) : (
            <div className="text-[11px] text-gray-500 mt-1.5">
              Mendukung URL Git HTTPS (misal: https://github.com/org/repo.git) atau SSH.
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ConnectGitRemote;
