import React from 'react';

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="modal-backdrop" role="dialog" aria-modal="true">
    <div className="modal">
      <header className="modal-header">
        <h3>{title}</h3>
        <button className="ghost" type="button" onClick={onClose}>
          Close
        </button>
      </header>
      <div className="modal-body">{children}</div>
    </div>
  </div>
);

export default Modal;
