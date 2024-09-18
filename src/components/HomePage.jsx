import React, { useState, useEffect, useRef } from "react";

function HomePage(props) {
  const { setAudioStream, setFile } = props;
  const [recordingStatus, setRecordingStatus] = useState("INACTIVE");
  const [audioChunks, setAudioChunks] = useState([]);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef(null);
  // Multipurpose Internet Mail Extensions type, is a string that indicates the format of a file or document
  const mimeType = "audio/webm";

  // on start record
  async function startRecording() {
    let tempStream;
    console.log("Recording Started");

    try {
      // to get access of audio of the device
      const streamData =await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      tempStream = streamData;
    } catch (e) {
      console.log(e.message);
      return;
    }
    setRecordingStatus("ACTIVE");
    // created the new MediaRecorder instance using stream(audio stream) which has mimetype audio/webm
    const media = new MediaRecorder(tempStream, {
      type: mimeType,
    });
    // reffering to our media obj
    mediaRecorder.current = media;
    // started recording means audio input avialable
    mediaRecorder.current.start();
    let localAudioChunks = [];
    // validated the data
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined" || event.data.size === 0) {
        return;
      }
      localAudioChunks.push(event.data);
    };

    setAudioChunks(localAudioChunks);
  }

  async function stopRecording() {
    setRecordingStatus("INACTIVE");
    console.log("Recording stopped");

    // stopping the recording
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      // creating a blob having the audio and setting it to our AudioStream
      // A blob object is simply a group of bytes that holds the data stored in a file
      const audioBlob = new Blob(audioChunks, { type: mimeType });

      setAudioStream(audioBlob);
      setAudioChunks([]);
      setDuration(0)
    };
  }

  useEffect(()=>{
    if(recordingStatus==='INACTIVE'){return}

    const interval = setInterval(()=>{
      setDuration(curr=>curr+1)
    },1000)
    
    return ()=>clearInterval(interval)
  })
  return (
    <main className="flex-1 p-4 flex flex-col text-center gap-3 sm:gap-4 md:gap-5 justify-center pb-20">
      <h1 className="font-semibold text-5xl sm:text-6xl md:text-7xl">
        Verba<span className="text-blue-400 bold ">Sync</span>
      </h1>
      <h3 className="font-medium md:text-lg">
        Record<span className=" text-blue-400"> &rarr;</span>
        Transcribe<span className=" text-blue-400"> &rarr;</span>
        Translate<span className=" text-blue-400"></span>
      </h3>
      <button onClick={recordingStatus==="ACTIVE"?stopRecording:startRecording} className="flex items-center text-base justify-between gap-4 mx-auto w-96 max-w-full my-4 specialBtn px-4 py-2 rounded-xl text-blue-400">
        <p className="text-blue-400">{ recordingStatus==='INACTIVE'?'Record':`Stop Recording`}</p>
        <div className="flex items-center gap-2 ">
          {/* {
            duration &&(
              <p className="text-sm">{duration}s</p>
            )
          } */}
        <i className={"fa-solid  duration-200 fa-microphone" + (recordingStatus==='ACTIVE'?'text-rose-300':'')}></i>
        </div>
        
      </button>
      <p className="text-base">
        Or{" "}
        <label className="text-blue-400 cursor-pointer hover:text-blue-600 duration-200">
          Upload
          <input
            onChange={(e) => {
              const tempFile = e.target.files[0];
              setFile(tempFile);
            }}
            className="hidden"
            type="file"
            accept=".mp3,.wave"
          />
        </label>{" "}
        mp3 file
      </p>
      <p className="italic text-slate-300">
        Free AI to translate or transcribe
      </p>
    </main>
  );
}

export default HomePage;
