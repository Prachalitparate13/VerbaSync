// npm i @xenova/transformes
// /* eslint-disable-next-line no-restricted-globals */ this Disallow specified global variables
// Disallowing usage of specific global variables can be useful if you want to allow a set of global variables by enabling an environment, but still want to disallow some of those.

// in this file we have setuip our pipeline using all the reqired functions and classes for our model
import { pipeline } from "@xenova/transformers";
import { MessageTypes } from "./preset";

class MyTranscriptionPipeline {
  static task = "automatic-speech-recognition";
  static model = "openai/whisper-tiny.en";
  static instance = null;
  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, null, {
        progress_callback,
      });
    }
    return this.instance;
  }
}
/* eslint-disable-next-line no-restricted-globals */
self.addEventListener("message", async (event) => {
  const { type, audio } = event.data;
  if (type === MessageTypes.INFERENCE_REQUEST) {
    await transcribe(audio);
  }
});

async function transcribe(audio) {
  sendLoadingMessage("loading");

  let pipeline;

  try {
    pipeline = await MyTranscriptionPipeline.getInstance(load_model_callback);
  } catch (err) {
    console.log(err.message);
  }
  sendLoadingMessage("success");

  const stride_length_s = 5;

  const generationTracker = new GenerationTracker(pipeline, stride_length_s);

  await pipeline(audio, {
    top_k: 0,
    do_sample: false,
    chunck_length: 30,
    stride_length_s,
    return_timepstaps: true,
    callback_function:
      generationTracker.callbackFunction.bind(generationTracker),
    chunck_callback: generationTracker.chunckCallback.bind(generationTracker),
  });

  generationTracker.sendFinalResult();
}

async function load_model_callback(data) {
  const { status } = data;
  if (status === "progress") {
    const { file, progress, loaded, total } = data;
    sendDownloadingMessage(file, progress, loaded, total);
  }
}

function sendLoadingMessage(status) {
    /* eslint-disable-next-line no-restricted-globals */
  self.postMessage({
    type: MessageTypes.LOADING,
    status,
  });
}

async function sendDownloadingMessage(file, progress, loaded, total) {
    /* eslint-disable-next-line no-restricted-globals */
  self.postMessage({
    type: MessageTypes.DOWNLOADING,
    file,
    progress,
    loaded,
    total,
  });
}

class GenerationTracker {
  constructor(pipeline, stride_length_s) {
    this.pipeline = pipeline;
    this.stride_length_s = stride_length_s;
    this.chunks = [];
    this.pipeline =
      pipeline?.processor.feature_extractor.config.chunck_length /
      pipeline?.model.config.max_source_position;
    this.processed_chunks = [];
    this.callbackFunctionCounter = 0;
  }

  sendFinalResult() {
    /* eslint-disable-next-line no-restricted-globals */
    self.postMessage({
      type: MessageTypes.INFERENCE_DONE,
    });
  }
  callbackFunction(beams) {
    this.callbackFunctionCounter += 1;
    if (this.callbackFunctionCounter % 10 != 0) {
      return;
    }
    const bestBeams = beams[0];
    let text = this.pipeline.tokenizer.decode(bestBeams.output_token_ids, {
      skip_special_tokens: true,
    });
    const result = {
      text,
      start: this.getLastChunkTimeStamp(),
      end: undefined,
    };
    createPartialResultMessage(result);
  }

  chunckCallback(data) {
    this.chunks.push(data);
    const [text, { chunks }] = this.pipeline.tokenizer._decode_asr(
      this.chunks,
      {
        time_precision: this.time_precision,
        return_timepstaps: true,
        force_full_sequence: false,
      }
    );
    this.processed_chunks = chunks.map((chunck, index) => {
      return this.processChunck(chunck, index);
    });

    createResultMessage(
      this.processed_chunks,
      false,
      this.getLastChunkTimeStamp()
    );
  }
  getLastChunkTimeStamp() {
    if (this.processed_chunks.length === 0) {
      return 0;
    }
  }

  processChunck(chunk, index) {
    const { text, timestamp } = chunk;
    const { start, end } = timestamp;

    return {
      index,
      text: `${text.trim()}`,
      start: Math.round(end) || Math.round(start + 0.9 * this.stride_length_s),
    };
  }


}

function  createResultMessage(results, isDone,completedUntilTimeStamp) {
    /* eslint-disable-next-line no-restricted-globals */
    self.postMessage({
        type: MessageTypes.RESULT,
        results,
        isDone,
        completedUntilTimeStamp
    })
    
  }

  function createPartialResultMessage(result){
/* eslint-disable-next-line no-restricted-globals */
    self.postMessage({
        type: MessageTypes.RESULT_PARTIAL,
        result 
    }
       
    )
  }
