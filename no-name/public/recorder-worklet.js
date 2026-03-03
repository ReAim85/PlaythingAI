/*
 * Copyright (C) 2026 Vishal Jha
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
// recorder-worklet.js
class RecorderProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0]; //float32 data from my mic
      const pcm16 = new Int16Array(channelData.length);

      for (let i = 0; i < channelData.length; i++) {
        //convert float32 (-1 to 1) to Int16 (-32768 to 32767) becaus of api constraints.(might remove later)
        let s = Math.max(-1, Math.min(1, channelData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      //sending the raw buffer back
      this.port.postMessage(pcm16.buffer);
    }
    return true;
  }
}
registerProcessor('recorder-worklet', RecorderProcessor);
