import React from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ 
  phoneNumber, 
  message = 'Halo, saya butuh bantuan' 
}) => {
  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      aria-label="Chat on WhatsApp"
      title="Chat dengan Customer Support"
    >
      <ChatBubbleLeftRightIcon className="w-6 h-6" />
    </button>
  );
};

export default WhatsAppButton;
