resource "azurerm_resource_group" "tube" {
    name = var.app_name
    location = var.location
}