terraform {
  required_providers {
    azuread = {
      source  = "hashicorp/azuread"
      version = "2.12.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "2.88.1"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "3.1.0"
    }
  }
}

provider "azurerm" {
  features {}
}
