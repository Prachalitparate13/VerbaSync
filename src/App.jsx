import { useEffect, useState, useRef } from "react";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import FileDisplay from "./components/FileDisplay";
import Information from "./components/Information";
import Transcribing from "./components/Transcribing";
import { MessageTypes } from "./utils/preset";

function App() {
  const [file, setFile] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const isAudioAvailable = file || audioStream;
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const worker = useRef(null);
  // to reset the process of recording or file upload
  function handleAudioReset() {
    setFile(null);
    setAudioStream(null);
  }

  useEffect(() => {
    if (!worker.current) {
      //Worker for ML model to work
      worker.current = new Worker(
        new URL("./utils/whispher.worker.js", import.meta.url, {
          type: "module",
        })
      );
    }

    // conditions for ML
    const onMessageReceived = async (e) => {
      switch (e?.data?.type) {
        case "DOWNLOADING":
          setDownloading(true);
          console.log("DOWNLOADING");
          break;
        case "LOADING":
          setLoading(true);
          console.log("LOADING");
          break;
        case "RESULT":
          setOutput(e.data.results);
          console.log("RESULT");
          break;
        case "INFERENCE_DONE":
          setFinished(true);
          console.log("INFERENCE DONE");
          break;
        default:
          break;
      }
    };
    worker.current.addEventListener('message',onMessageReceived)

    return ()=>{
      worker.current.removeEventListener('message',onMessageReceived)
    }
  }, []);

  // getting audio buffer from the file
  async function readAudioFrom(file) {
    const sampling_rate=16000
    const audioContext=new AudioContext({sampleRate:sampling_rate})
    const response= await file.arrayBuffer()
    const decode = await audioContext.decodeAudioData(response)
    const audio = decode.getChannelData(0)
    return audio
  }

  async function  handleFormSubmission() {
    if(!file && !audioStream)
      return
    let audio= await readAudioFrom(file?file:audioStream)

    const modelName=`openai/whisper-tiny.en`

    worker.current.postMessage({
      type:MessageTypes.INFERENCE_REQUEST,
      audio,
      modelName
    })
  }

  return (
    <div className="flex flex-col max-w-[1000px] mx-auto w-full">
      <section className="min-h-screen flex flex-col">
        {/* page rendering based on requirements */}
        <Header />
        {output ? (
          <Information />
        ) : loading ? (
          <Transcribing />
        ) : isAudioAvailable ? (
          <FileDisplay
          handleFormSubmission={handleFormSubmission}
            handleAudioReset={handleAudioReset}
            file={file}
            audioStream={audioStream}
          />
        ) : (
          <HomePage setFile={setFile} setAudioStream={setAudioStream} />
        )}
      </section>
      <footer></footer>
    </div>
  );
}

export default App;
