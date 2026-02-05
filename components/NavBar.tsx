"use client";

import { IoMdSettings } from "react-icons/io";
import Popup from "@/components/PopUp";
import { useState } from "react";
import Settings from "@/components/Settings";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="absolute p-1 grid place-content-start bg-gray-800 rounded-full">
        <button
          onClick={() => {
            setOpen(true);
          }}
          className="w-max cursor-pointer"
        >
          <IoMdSettings size={25} />
        </button>
      </div>

      <Popup
        isOpen={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Settings />
      </Popup>
    </>
  );
}
