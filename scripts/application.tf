data "azurerm_subscription" "primary" {}

data "azuread_client_config" "current" {}

resource "azuread_application" "nodetube" {
  display_name = var.app_name
  owners       = [data.azuread_client_config.current.object_id]
}

resource "azuread_service_principal" "nodetube" {
  application_id               = azuread_application.nodetube.application_id
  app_role_assignment_required = false
  owners                       = [data.azuread_client_config.current.object_id]
}

resource "azuread_service_principal_password" "nodetube" {
  service_principal_id = azuread_service_principal.nodetube.object_id
}

resource "azurerm_role_assignment" "nodetube" {
  scope                = data.azurerm_subscription.primary.id
  role_definition_name = "Contributor"
  principal_id         = azuread_service_principal.nodetube.object_id
}

output "client_secret" {
    value = azuread_service_principal_password.nodetube.value
    sensitive = true
}
