interface NotificationToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export function NotificationToast({ message, type, onClose }: NotificationToastProps) {
  const getContainerClass = () => {
    switch (type) {
      case 'success': return 'is-success';
      case 'error': return 'is-error';
      case 'warning': return 'is-warning';
      default: return 'is-dark';
    }
  };

  return (
    <div className={`nes-container is-rounded bg-white text-black ${getContainerClass()} pointer-events-auto min-w-[300px] shadow-lg animate-fade-in-up z-50`}>
      <div className="flex justify-between items-start gap-4">
        <p className="text-sm">{message}</p>
        <button type="button" className="nes-btn is-error is-small scale-75 origin-top-right" onClick={onClose}>
            X
        </button>
      </div>
    </div>
  );
}
