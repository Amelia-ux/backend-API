const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const fetch = require('node-fetch');
const wav = require('node-wav');
const { exec } = require('child_process');

function resampleAudio(filePath, outputFilePath, targetSampleRate) {
  return new Promise((resolve, reject) => {
    const command = `sox ${filePath} -r ${targetSampleRate} ${outputFilePath}`;
    exec(command, (error) => {
      if (error) {
        reject(error);
      } else {
        const resampledBuffer = fs.readFileSync(outputFilePath);
        const audioData = wav.decode(resampledBuffer).channelData[0];
        resolve(audioData);
      }
    });
  });
}

async function load_wav_16k(filePath) {
  const outputFilePath = './output.wav';
  const targetSampleRate = 16000;

  try {
    const audioData = await resampleAudio(filePath, outputFilePath, targetSampleRate);
    fs.unlinkSync(outputFilePath);
    return audioData;
  } catch (error) {
    console.error('Error occurred during audio resampling:', error);
    return null;
  }
}

async function run(){
    const MODEL_URL = 'http://127.0.0.1:8080/model_f/model.json';
    const model = await tf.loadLayersModel(MODEL_URL);
    console.log(model.summary());
    const wavPath = './data_babies_cry/belly-pain/bp-16.wav';
    load_wav_16k(wavPath).then((audioData) => {
        if (audioData) {
          console.log(audioData);
        }
    });
}
run();
