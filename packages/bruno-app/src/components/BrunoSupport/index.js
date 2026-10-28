import React from 'react';
import Modal from 'components/Modal/index';
import { IconSpeakerphone, IconBrandTwitter, IconBrandGithub, IconBrandDiscord, IconBook } from '@tabler/icons';
import StyledWrapper from './StyledWrapper';

const BrunoSupport = ({ onClose }) => {
  return (
    <StyledWrapper>
      <Modal size="sm" title="NgaRingApi Support" handleCancel={onClose} hideFooter={true}>
        <div className="collection-options">
          <div className="mt-2">
            <a href="https://github.com/nyawit-dev/ngaRing-Api#readme" target="_blank" className="flex items-end">
              <IconBook size={18} strokeWidth={2} />
              <span className="label ml-2">Documentation</span>
            </a>
          </div>
          <div className="mt-2">
            <a href="https://github.com/nyawit-dev/ngaRing-Api/issues" target="_blank" className="flex items-end">
              <IconSpeakerphone size={18} strokeWidth={2} />
              <span className="label ml-2">Report Issues</span>
            </a>
          </div>
          <div className="mt-2">
            <a href="https://github.com/nyawit-dev/ngaRing-Api" target="_blank" className="flex items-end">
              <IconBrandGithub size={18} strokeWidth={2} />
              <span className="label ml-2">GitHub Repository</span>
            </a>
          </div>
        </div>
      </Modal>
    </StyledWrapper>
  );
};

export default BrunoSupport;
