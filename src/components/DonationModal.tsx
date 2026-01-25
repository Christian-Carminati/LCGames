'use client';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export function DonationModal({ isOpen, onClose, username }: DonationModalProps) {
  if (!isOpen) return null;

  const kofiUrl = `https://ko-fi.com/${username}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
      <div className="nes-container is-rounded is-dark with-title max-w-md w-full relative bg-gray-900">
        <p className="title">PAYMENT METHOD</p>
        
        <button 
            type="button" 
            className="absolute top-[-10px] right-[-10px] nes-btn is-error is-small"
            onClick={onClose}
        >
            X
        </button>

        <div className="flex flex-col gap-4 mt-4">
            <p className="text-center text-sm mb-4">CHOOSE YOUR WEAPON:</p>
            
            <a 
                href={kofiUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="nes-btn is-primary w-full flex items-center justify-center gap-2"
                onClick={onClose}
            >
               <i className="nes-icon coin is-small"></i> PAYPAL
            </a>

            <a 
                href={kofiUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="nes-btn is-warning w-full flex items-center justify-center gap-2"
                onClick={onClose}
            >
               CREDIT CARD
            </a>
            
            <p className="text-xs text-center text-gray-500 mt-2">
                (Both options supported via Ko-fi)
            </p>
        </div>
      </div>
    </div>
  );
}
