import requests

#try to run the locally
resp = requests.post('http://127.0.0.1:5000/', files={'file': './data_babies_cry/tired/1309B82C-F146-46F0-A723-45345AFA6EA8-1430059864-1.0-f-04-ti.wav'})

#not local
# resp = requests.post('https://getprediction-7rpnuc6dkq-as.a.run.app', files={'file': './data_babies_cry/tired/1309B82C-F146-46F0-A723-45345AFA6EA8-1430059864-1.0-f-04-ti.wav'})

print(resp.json())
# print(resp.text)

