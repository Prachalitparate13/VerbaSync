import React, { useState, useEffect, useRef } from "react";
import Transcription from "./Transcription";
import Translation from "./Translation";

function Information(props) {
  const { output } = props;
  const [tab, setTab] = useState("transcription");
  const [translation, setTranslation] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [toLanguage, setToLanguage] = useState("Select Language");
  const worker = useRef(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(
        new URL("../utils/translate.worker.js", import.meta.url),
        {
          type: "module",
        }
      );
    }
    const onMessageReceived = async (e) => {
      // console.log(e.data)
      switch (e.data.status) {
        case "initiate":
          console.log("initiate");
          break;
        case "progress":
          console.log("progress");
          break;
        case "update":
          setTranslation(e.data.output);
          console.log(e.data.output);
          break;
        case "complete":
          setTranslating(false);
          console.log("ready");
          break;
        default:
          break;
      }
    };

    worker.current.addEventListener("message", onMessageReceived);

    return () =>
      worker.current.removeEventListener("message", onMessageReceived);
  });

  const textElement =
    tab === "transcription"
      ? output.map((val) => val.text)
      : translation || "No Translation";

  function handleCopy() {
    navigator.clipboard.writeText(textElement);
  }

  function handleDownload() {
    const element = document.createElement("a");
    const file = new Blob([textElement], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download=`Verbasync_${new Date().toString()}.txt`;
    document.body.appendChild(element);
    element.click();
  }

  function generateTranslation() {
    if (translating || toLanguage === "Select Language") {
      return;
    }
    setTranslating(true);
    worker.current.postMessage({
      text: output.map((val) => val.text),
      src_lang: "eng_Latn",
      tgt_lang: toLanguage,
    });
  }

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
            "px-4 py-2 duration-200  " +
            (tab === "transcription"
              ? "bg-blue-300 text-white"
              : "text-blue-300 hover:text-blue-600")
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
      <div className=" my-8 flex flex-col ">
        {tab === "transcription" ? (
          <Transcription {...props} textElement={textElement} />
        ) : (
          <Translation
            {...props}
            textElement={textElement}
            toLanguage={toLanguage}
            translating={translating}
            // setTranslation={setTranslation}
            // setTranslating={setTranslating}
            setToLanguage={setToLanguage}
            generateTranslation={generateTranslation}
          />
        )}

        <div className="my-8 flex items-center gap-4 mx-auto">
          <button
            title="Copy"
            onClick={handleCopy}
            className="bg-white hover:text-blue-600 duration-200  text-blue-300 aspect-square grid-items-center  p-2 rounded px-3"
          >
            <i className="fa-solid fa-copy"></i>
          </button>
          <button
            title="Download"
            onClick={handleDownload}
            className="bg-white hover:text-blue-600 duration-200 text-blue-300 aspect-square grid-items-center  p-2 rounded px-3"
          >
            <i className="fa-solid fa-download"></i>
          </button>
        </div>
      </div>
    </main>
  );
}

export default Information;
