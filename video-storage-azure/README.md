# Azure Storage Service

Provides interface to Azure Blob Storage for storing videos.

## Configuration

Use enviroment variables to configure service:

* `PORT` - port to listen;
* `STORAGE_ACCOUNT_NAME` - Azure Storage account name;
* `STORAGE_ACCESS_KEY` - Azure Storage access key.

## Available routes

### GET /

Dummy route with service status.

### GET /video?path={path}

Retrives video from storage at specified *path*. Supports `Range` header for partial retrieving.

### PUT /video?path={path}

Stores video at *path* in storage.
