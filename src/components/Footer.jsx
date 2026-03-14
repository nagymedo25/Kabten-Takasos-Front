import { FaHeart, FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative mt-auto">
      {/* Animated Wave */}
      <div className="footer-waves">
        <svg
          className="waves"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18v44h-352z"
            />
          </defs>
          <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0"  fill="rgba(99,102,241,0.15)" />
            <use xlinkHref="#gentle-wave" x="48" y="3"  fill="rgba(139,92,246,0.12)" />
            <use xlinkHref="#gentle-wave" x="48" y="5"  fill="rgba(99,102,241,0.08)" />
            <use xlinkHref="#gentle-wave" x="48" y="7"  fill="#0f172a" />
          </g>
        </svg>
      </div>

      {/* Footer Content */}
      <div className="bg-dark-950 border-t border-dark-700/30 py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">

          {/* Logo row */}
          <div className="flex items-center gap-2 text-dark-400">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
              <img src="/Logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-white">كابتن تخصص</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-2 text-sm text-dark-400 flex-wrap justify-center">
            <a href="#" className="hover:text-primary-400 transition-colors duration-200">
              الشروط والأحكام
            </a>
            <span className="text-dark-600">|</span>
            <a href="#" className="hover:text-primary-400 transition-colors duration-200">
              سياسة الخصوصية
            </a>
            <span className="text-dark-600">|</span>
            <a href="#" className="hover:text-primary-400 transition-colors duration-200">
              تواصل معنا
            </a>
          </div>

          {/* Copyright */}
          <p className="text-dark-500 text-xs flex items-center gap-1" dir="ltr">
            © 2026 Developed with
            <FaHeart className="text-red-500 text-xs animate-pulse" />
            by
            <a
              href="https://www.facebook.com/mahmoud.nagy.463807/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-300 hover:to-pink-400 transition-all duration-300"
              style={{ textShadow: 'none' }}
            >
              Eng Mahmoud Nagy
            </a>
          </p>
        </div>

        {/* Floating Farewell Button */}
        <Link to="/farewell" className="absolute bottom-3 right-3 sm:bottom-6 sm:right-8 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-1.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105 transition-all z-50 ring-2 ring-emerald-400/50 max-w-[180px] sm:max-w-none">
          <FaHeart className="text-pink-200 relative z-10 text-xs sm:text-sm" />
          <span className="text-xs sm:text-sm relative z-10">اضغط هنا يا صديقي</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
