import React from 'react'

function FileDisplay(props) {
  const {handeleAudioReset,file,audioStrean}=props
  return (
   < main className="flex-1 p-4 flex flex-col text-center gap-3 sm:gap-4 md:gap-5 justify-center pb-20">
      <h1 className="font-semibold text-5xl sm:text-6xl md:text-7xl">
        Your<span className="text-blue-400 bold ">File</span>
      </h1>
      </main>
  )
}

export default FileDisplay
