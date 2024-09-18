import React, { useState } from "react";
import Transcription from "./Transcription";
import Translation from "./Translation";

function Information() {
  const [tab, setTab] = useState("transcription");
  return (
    <main className="flex-1 p-4 flex flex-col text-center gap-3 sm:gap-4 justify-center pb-20 max-w-prose w-full mx-auto">
      <h1 className="font-semibold text-5xl sm:text-6xl md:text-7xl ">
        Your<span className="text-blue-400 bold ">Transcription</span>
      </h1>
      <div className="grid grid-cols-2 mx-auto bg-white border-solid border-blue-300 shadow rounded-full overflow-hidden items-center">
        <button
          onClick={() => {
            setTab("transcription");
          }}
          className={
            "px-4 py-2 duration-200 font-medium " +
            (tab === "transcription"
              ? "bg-blue-400 text-white"
              : "text-blue-400 hover:text-blue-600")
          }
        >
          Transcription
        </button>
        <button
          onClick={() => {
            setTab("translation");
          }}
          className={
            "px-4 py-2 duration-200 font-medium " +
            (tab === "translation"
              ? "bg-blue-400 text-white"
              : "text-blue-400 hover:text-blue-600")
          }
        >
          Translation
        </button>
      </div>
      {tab === "transcription" ? (<Transcription />) : (<Translation />)}
    </main>
  );
}

export default Information;
