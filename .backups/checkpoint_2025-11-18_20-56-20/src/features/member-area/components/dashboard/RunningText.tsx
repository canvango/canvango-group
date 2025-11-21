import React from 'react';
import { Volume2 } from 'lucide-react';

interface RunningTextProps {
  text: string;
}

const RunningText: React.FC<RunningTextProps> = ({ text }) => {
  return (
    <>
      <style>{`
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .marquee-container {
          animation: marquee-scroll 30s linear infinite;
          display: inline-block;
        }
        .marquee-text {
          padding-right: 200px;
        }
      `}</style>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg overflow-hidden mb-6">
        <div className="flex items-center px-4 py-3">
          <Volume2 className="w-5 h-5 text-yellow-600 flex-shrink-0 mr-3" aria-hidden="true" />
          <div className="flex-1 overflow-hidden relative">
            <div className="flex">
              <span className="marquee-container text-sm text-yellow-800 font-medium whitespace-nowrap">
                <span className="marquee-text">{text}</span>
                <span className="marquee-text">{text}</span>
              </span>
              <span className="marquee-container text-sm text-yellow-800 font-medium whitespace-nowrap">
                <span className="marquee-text">{text}</span>
                <span className="marquee-text">{text}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RunningText;
