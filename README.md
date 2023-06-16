# Halodek by C23-PR534
A mobile app for baby cry analyzer is a tool designed to help parents or caregivers understand and analyze the crying patterns of infants. This app aims to assist parents in better understanding and responding to their baby's needs, promoting effective communication and care.

## Cloud Computing
This is the backend repository Halodek Project For CRUD using RESTFul API. See the documentation for use RESTAPI [[Docummentation]](https://docs.google.com/document/d/1eN2xFW4rpklSDkPZWBPh6-LZ688wyZRP2QFsMmWIk1A/edit?usp=sharing)
### Create Google Cloud SQL (MySQL)
1. Create instance and choose MySQL
2. Provide a name and password for your instance.
3. Configure the instance settings such as region, machine type, storage capacity, and database version.
4. Click on the "Create" button to create the MySQL instance.
5. Wait for the instance to be provisioned. The process may take a few minutes.

### Deploy to Google Cloud Platform
#### Docker Image
1. Clone this repository on your VM instance
2. Go to source directory
```cd halodek-project```
3. Build a docker image
```
# build docker image
docker build -t <image-name> .
docker tag <image-name> gcr.io/<project-id>/<image-name>

# configure docker for google cloud
gcloud auth configure-docker

# push image
docker push gcr.io/<project-id>/<image-name>
```
#### Cloud Run
1. Create service and deploy one revision from an existing container image
2. On container image URL, select container registry and choose the latest image
3. Specify a service name, region, and select the container image you pushed to the Container Registry.
4. Configure additional options such as the number of instances, CPU, memory, and maximum request concurrency.
5. Set the authentication method, if required.
6. Click on "Create" to deploy the container image to Cloud Run.

## Mobile Development
### Featured Technologies
* Kotlin : It is a contemporary, succinct, and secure programming language. With its brevity, safety, and interoperability features, Kotlin stands out in the modern development landscape.
* Retrofit : Retrofit serves as the mechanism that transforms API interfaces into callable objects. It acts as the bridge that allows to seamlessly interact with APIs by encapsulating them within callable entities.
* MediaRecorder : MediaRecorder is the modern Android framework API for audio recording that supersedes the outdated audio recording libraries.
### Screenshot
<img src="MD/images/ss-2.png">
<img src="MD/images/ss-1.png">
