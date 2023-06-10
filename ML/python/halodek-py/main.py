import tensorflow as tf
import numpy as np
import librosa
from flask import Flask, request, jsonify

model = tf.keras.models.load_model('temp_model.h5')

def resample_audio(waveform, sample_rate, target_sample_rate):
    resampled_waveform = librosa.resample(waveform, sample_rate, target_sample_rate)
    return resampled_waveform

def load_wav_16k(f):
    waveform, _ = librosa.load(f, sr=16000, mono=True)
    return waveform

def preprocess(file_path):
    wav = load_wav_16k(file_path)
    wav = wav[:70000]
    zero_padding = tf.zeros([70000 - tf.shape(wav)[0]], dtype=tf.float32)
    wav = tf.concat([zero_padding, wav], 0)
    spectrogram = tf.signal.stft(wav, frame_length=320, frame_step=32)
    spectrogram = tf.abs(spectrogram)
    spectrogram = tf.expand_dims(spectrogram, axis=-1)
    spectrogram = tf.expand_dims(spectrogram, axis=0)
    return spectrogram

def predict(spectrogram):
  prediction = model.predict(spectrogram)
  return np.argmax(prediction)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

@app.route('/', methods=['GET', 'POST'])
def index():
  if request.method=='POST':
    file = request.files.get('file')
    if file is None or file.filename=='':
      return jsonify({"error":"file not found"})
    
    try:
      audio_file = file.read()
      spectrogram = preprocess(audio_file)
      prediction = predict(spectrogram)
      return jsonify({"prediction":int(prediction)})
    except Exception as e:
      return jsonify({"error":str(e)})

  return 'Ok'

if __name__ == '__main__':
  app.run(debug=True)
