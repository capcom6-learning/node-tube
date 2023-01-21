# Azure Storage Service

Provides interface to S3-compatible Storage for storing videos.

## Table of contents

- [Azure Storage Service](#azure-storage-service)
  - [Table of contents](#table-of-contents)
  - [Configuration](#configuration)
  - [Available routes](#available-routes)
    - [GET /](#get-)
    - [GET /video?path={path}](#get-videopathpath)
    - [PUT /video?path={path}](#put-videopathpath)

## Configuration

Use environment variables to configure service:

* `PORT` - port to listen to;
* `STORAGE__ENDPOINT` - S3 storage endpoint;
* `STORAGE__REGION` - S3 storage region;
* `STORAGE__BUCKET_NAME` - S3 storage bucket name;
* `STORAGE__CONTAINER_NAME` - S3 storage key prefix;
* `STORAGE__CREDENTIALS__ACCESS_KEY_ID` - S3 storage access key id;
* `STORAGE__CREDENTIALS__SECRET_ACCESS_KEY` - S3 storage secret access key.

## Available routes

### GET /

Dummy route with service status.

### GET /video?path={path}

Retrives video from storage at specified *path*. Supports `Range` header for partial retrieving.

### PUT /video?path={path}

Stores video at *path* in storage.
