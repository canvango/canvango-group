import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface TopUpSuccessModalProps {
  isOpen: boolean;
  amount: number;
  onClose: () => void;
}

const TopUpSuccessModal: React.FC<TopUpSuccessModalProps> = ({
  isOpen,
  amount,
  onClose,
}) => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      // Delay content animation slightly after modal appears
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  const handleViewHistory = () => {
    onClose();
    navigate('/riwayat-transaksi');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Confetti Container */}
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              backgroundColor: ['#0866FF', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 4)],
            }}
          />
        ))}
      </div>

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`
            relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8
            transform transition-all duration-500
            ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
          `}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Icon with Animation */}
          <div className="flex justify-center mb-6">
            <div
              className={`
                relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600
                flex items-center justify-center
                shadow-lg shadow-green-500/50
                transform transition-all duration-700
                ${showContent ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
              `}
            >
              <CheckCircle className="w-12 h-12 text-white animate-pulse" />
              
              {/* Glow rings */}
              <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-green-400/20 animate-pulse" />
            </div>
          </div>

          {/* Heading */}
          <h2
            className={`
              text-2xl font-bold text-gray-900 text-center mb-3
              transform transition-all duration-500 delay-200
              ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
            `}
          >
            Pembayaran Berhasil! 🎉
          </h2>

          {/* Description */}
          <p
            className={`
              text-sm text-gray-700 text-center mb-6
              transform transition-all duration-500 delay-300
              ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
            `}
          >
            Saldo sebesar{' '}
            <span className="font-bold text-green-600 relative inline-block">
              {formatCurrency(amount)}
              {/* Shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine" />
            </span>
            {' '}telah ditambahkan ke akun Anda.
          </p>

          {/* Buttons */}
          <div
            className={`
              space-y-3
              transform transition-all duration-500 delay-400
              ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
            `}
          >
            {/* Primary Button */}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Selesai
            </button>

            {/* Secondary Button */}
            <button
              onClick={handleViewHistory}
              className="w-full px-6 py-3 text-sm font-medium text-blue-600 bg-white border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Lihat Riwayat
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopUpSuccessModal;
