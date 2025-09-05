import React from "react";

const Footer = () => {
  return (
    <footer className="w-full text-center py-10 text-white bg-black">
      <div className="text-sm">© 2025 Made by <strong>Damam Naga Revanth</strong></div>
      <div className="mt-2 text-sm">
        <a
          href="https://www.linkedin.com/in/revanth-damam-964869267"
          target="_blank"
          rel="noopener noreferrer"
          className="mr-4 text-white hover:text-slate-200 hover:underline"
        >
          LinkedIn
        </a>
        <a
          href="https://github.com/RevanthDamam"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-slate-200 hover:underline"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
};

export default Footer;


