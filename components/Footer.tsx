
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-auto">
      <div className="container mx-auto px-4 py-4 text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} Medical Coding Online. All Rights Reserved.  An <a  href="https://annapoornainfo.com"  target="_blank"  rel="noopener noreferrer"  > Annapoorna Infotech </a> Venture</p>
        
      
      </div>
    </footer>
  );
};

export default Footer;
