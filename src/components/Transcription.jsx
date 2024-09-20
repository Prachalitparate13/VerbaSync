import React from "react";

function Transcription(props) {
  const { textElement } = props;
  return (
    <div>
      <h1>{textElement}</h1>
    </div>
  );
}

export default Transcription;
