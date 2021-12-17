terraform {
  backend "azurerm" {
    resource_group_name = "Microservices"
    storage_account_name = "capcom"
    container_name = "nodetube"
    key = "terraform.tfstate"
  }
}