const Modal = ({ isOpen, onClose, children }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-25"></div>
          <div className="absolute top-[40%] right-[50%] bg-white p-6 rounded-lg shadow-xl z-10">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              onClick={onClose}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="mt-2">{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
