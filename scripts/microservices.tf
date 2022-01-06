locals {
    login_server = azurerm_container_registry.container_registry.login_server
    username = azurerm_container_registry.container_registry.admin_username
    password = azurerm_container_registry.container_registry.admin_password
    rabbit = "amqp://guest:guest@rabbit:5672"
    database = "mongodb://database:27017"
}

module "gateway-microservice" {
    source ="./modules/microservice"
    service_name = "gateway"
    service_type = "LoadBalancer"
    session_affinity = "ClientIP"
    login_server = local.login_server
    username = local.username
    password = local.password
    app_version = var.app_version
    env = {
        METADATA_HOST: "metadata"
        METADATA_PORT: 80
        VIDEO_STREAMING_URL: "http://video-streaming"
        VIDEO_UPLOADING_URL: "http://video-upload"
        HISTORY_URL: "http://history"
    }
}

module "video-streaming-microservice" {
    source ="./modules/microservice"
    service_name = "video-streaming"
    login_server = local.login_server
    username = local.username
    password = local.password
    app_version = var.app_version
    env = {
        VIDEO_STORAGE_HOST: "video-storage"
        VIDEO_STORAGE_PORT: 80
        RABBIT: local.rabbit
        METADATA_HOST: "metadata"
        METADATA_PORT: 80
    }
}

module "video-upload-microservice" {
    source ="./modules/microservice"
    service_name = "video-upload"
    login_server = local.login_server
    username = local.username
    password = local.password
    app_version = var.app_version
    env = {
        VIDEO_STORAGE_HOST: "video-storage"
        VIDEO_STORAGE_PORT: 80
        RABBIT: local.rabbit
        METADATA_HOST: "metadata"
        METADATA_PORT: 80
    }
}

module "azure-storage-microservice" {
    source ="./modules/microservice"
    service_name = "video-storage-azure"
    dns_name = "video-storage"
    login_server = local.login_server
    username = local.username
    password = local.password
    app_version = var.app_version
    env = {
        STORAGE_ACCOUNT_NAME = var.storage_account_name
        STORAGE_ACCESS_KEY = var.storage_access_key
    }
}

module "history-microservice" {
    source ="./modules/microservice"
    service_name = "history"
    login_server = local.login_server
    username = local.username
    password = local.password
    app_version = var.app_version
    env = {
        RABBIT: local.rabbit
        DBHOST: local.database
        DBNAME: "history"
    }
}

module "metadata-microservice" {
    source ="./modules/microservice"
    service_name = "metadata"
    login_server = local.login_server
    username = local.username
    password = local.password
    app_version = var.app_version
    env = {
        RABBIT: local.rabbit
        DBHOST: local.database
        DBNAME: "metadata"
    }
}

