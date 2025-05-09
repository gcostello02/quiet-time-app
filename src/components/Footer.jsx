import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-300 shadow-sm py-4">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between">

        {/* Legal Links */}
        <div className="flex flex-row text-center sm:text-left mb-3 sm:mb-0 sm:w-1/3">
          <Link key="Other" to="/information" className='text-sm font-medium rounded-md border-b-2 border-transparent px-3 py-2 text-gray-900 hover:bg-gray-100 hover:text-black block'>Privacy & Contact Us</Link>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-3 sm:mb-0 sm:w-1/3">
          <img src={logo} className="h-12" alt="Logo" />
        </div>

        {/* Copyright Notice */}
        <div className="text-center text-gray-700 sm:text-right text-sm sm:w-1/3">
          <span>© 2025 TAWG. All Rights Reserved.</span>
        </div>

      </div>
    </footer>
  );
}