import React from "react";
import { LuX } from "react-icons/lu";

const Drawer = ({ isOpen, onClose, title, children }) => {
  return (
    <div
      // optional backdrop for outside click close
      className={`fixed inset-0 z-40 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`absolute top-[64px] right-0 h-[calc(100dvh-64px)] w-full md:w-[40vw] p-4 overflow-y-auto bg-white shadow-2xl shadow-cyan-800/10 border-l border-gray-200 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        tabIndex="-1"
        aria-labelledby="drawer-right-label"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h5
            id="drawer-right-label"
            className="flex items-center text-base font-semibold text-black"
          >
            {title}
          </h5>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center"
            aria-label="Close drawer"
          >
            <LuX className="text-lg" />
          </button>
        </div>

        {/* Body Content */}
        <div className="text-sm mx-3 mb-6">{children}</div>
      </div>
    </div>
  );
};

export default Drawer;
