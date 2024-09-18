import React from "react";

function FileDisplay(props) {
  const { handeleAudioReset, file, audioStrean } = props;
  return (
    <main className="flex-1 p-4 w-72 flex flex-col text-center gap-3 sm:gap-4 md:gap-5 sm:w-96 justify-center pb-20 max-w-full mx-auto">
      <h1 className="font-semibold text-5xl sm:text-6xl md:text-7xl">
        Your<span className="text-blue-400 bold ">File</span>
      </h1>
      <div className="flex  flex-col text-left my-4">
        <h3 className="font-semibold text-blue-400">Name</h3>
        <p>{file ? file?.name : "Recoreded Audio"}</p>
      </div>
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handeleAudioReset}
          className="text-slate-400 hover:text-blue-600 duration-200"
        >
          Reset
        </button>
        <button className="specialBtn px-3 py-2 rounded-lg text-blue-400 flex items-center gap-2">
          <p>Transcribe </p>
          <i className="fa-solid fa-pen-nib"></i>
        </button>
      </div>
    </main>
  );
}

export default FileDisplay;
