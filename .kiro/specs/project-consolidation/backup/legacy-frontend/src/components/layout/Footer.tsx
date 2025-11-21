import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="ml-0 md:ml-60 bg-white border-t border-gray-200 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <p className="text-sm text-gray-600 text-center">
          © {currentYear} Canvango Group. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
