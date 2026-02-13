"use client";

import { useState, useEffect } from "react";
import Popup from "./PopUp";

export default function FirstVisitMessage() {
  const [open, setOpen] = useState(false);

  function getFromLocalStorage(key: string) {
    if (typeof window !== "undefined") {
      const value = localStorage.getItem(key);
      return value;
    }
    return null;
  }

  function handleDontShowAgain() {
    localStorage.setItem("show-message", "false");
    setOpen(false);
  }

  useEffect(() => {
    const shouldShow = getFromLocalStorage("show-message");
    if (shouldShow !== "false") setOpen(true);
  }, []);

  return (
    <>
      <Popup
        isOpen={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <div className="max-w-3xl h-max p-4 flex flex-col items-center justify-center">
          <span className="text-center text-gray-300 text-wrap max-w-full flex flex-wrap p-4">
            This project demonstrates how an AI agent work with different tools
            to fullfil user query.
            <br />
            It can work with simple javascript program like fibonacci series,
            factorial, etc, but it can not work with complex code like react or
            express code.
          </span>
          <div className="w-full flex flex-col gap-4 sm:flex-row p-2 items-center justify-around">
            <button
              className="p-2 w-48 cursor-pointer bg-transparent border-2 border-gray-600 rounded-xl"
              onClick={() => {
                setOpen(false);
              }}
            >
              OK
            </button>
            <button
              className="p-2 w-48 cursor-pointer bg-transparent border-2 border-gray-600 rounded-xl"
              onClick={handleDontShowAgain}
            >
              Don&#39;t Show Again
            </button>
          </div>
        </div>
      </Popup>
    </>
  );
}
