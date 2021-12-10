resource "azurerm_container_registry" "container_registry" {
  name = "nodetube"
  resource_group_name = azurerm_resource_group.node-tube.name
  location = "westeurope"
  admin_enabled = true
  sku = "Basic"
}
