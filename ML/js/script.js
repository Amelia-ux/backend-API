const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const wav = require('node-wav');
const { exec } = require('child_process');

//function to resample the wav audio
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

//load the wav file
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

//preprocess the wav form to spectrogram
async function preprocess(file_path) {
  const wav = await load_wav_16k(file_path);
  const truncatedWav = wav.slice(0, 94000);
  const zero_padding = tf.zeros([94000 - truncatedWav.length], dtype=tf.float32);
  const paddedWav = tf.concat([zero_padding, truncatedWav], 0);
  const spectrogram = tf.signal.stft(paddedWav, 320, 32);
  const absSpectrogram = tf.abs(spectrogram);
  const expandedSpectrogram = tf.expandDims(absSpectrogram, 2);

  return expandedSpectrogram;
}

//predict the file
async function predict(model, input) {
  const preprocessedInput = await preprocess(input);
  const expandedTensor = tf.expandDims(preprocessedInput.slice([0, 0]), [0]);
  const predictions = await model.predict(expandedTensor);

  return predictions;
}

//example of code usage
async function run(){
  //load model
  const MODEL_URL = 'http://127.0.0.1:8080/model_f/model.json';
  const model = await tf.loadLayersModel(MODEL_URL);

  //example of belly-pain audio file
  const wavPath = './data_babies_cry/belly-pain/bp-16.wav';

  //classify the audio, and this variable will return the value of probabilities of each classes
  const result = await predict(model, wavPath); //return the Tensor object
  const resultArray = result.arraySync(); //get the value

  //get the index of maximum value
  //0 = belly-pain
  //1 = burp
  //2 = discomfort
  //3 = hungry
  //4 = lonely
  //5 = scared
  //6 = temperature
  //7 = tired
  const maxIndex = tf.argMax(tf.tensor(resultArray)).dataSync()[0];
  console.log(maxIndex);

}

run();
