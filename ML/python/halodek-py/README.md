gcloud builds submit --tag gcr.io/<project_id>/<function_name>
gcloud run deploy --image gcr.io/<project_id>/<function_name> --platform managed

=Halodek=
gcloud builds submit --tag gcr.io/halodek-project/index
gcloud run deploy --image gcr.io/halodek-project/index --platform managed

*getprediction API
https://getprediction-7rpnuc6dkq-as.a.run.app
