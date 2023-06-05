"use strict";
const { Storage } = require("@google-cloud/storage");
const path = require("path");

const pathKey = path.resolve("./serviceAccountKey.json");

// storage
const gcs = new Storage({
  projectId: "halodek-project",
  keyFilename: pathKey,
});

// bucket
const bucketName = "halodek-project";
const bucket = gcs.bucket(bucketName);

function getPublicUrl(filename) {
  return "https://storage.googleapis.com/" + bucketName + "/" + filename;
}

let AudioUpload = {};

AudioUpload.uploadToGcs = (req, res, next) => {
  if (!req.file) return next();

  const filename = `${Date.now()}-${audioFile.originalname}`;
  const file = storage.bucket(bucketName).file(filename);
  const stream = file.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  stream.on("error", (err) => {
    req.file.cloudStorageError = err;
    next(err);
  });

  stream.on("finish", () => {
    req.file.cloudStorageObject = gcsname;
    req.file.cloudStoragePublicUrl = getPublicUrl(gcsname);
    next();
  });

  stream.end(req.file.buffer);
};

module.exports = AudioUpload;
