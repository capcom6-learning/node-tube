set -u

: "$VERSION"
: "$ARM_TENANT_ID"
: "$ARM_SUBSCRIPTION_ID"

cd ./scripts

export KUBERNETES_SERVICE_HOST="" # Workaround for https://github.com/terraform-providers/terraform-provider-kubernetes/issues/679
terraform init && \
    terraform apply -auto-approve \
        -var "app_version=$VERSION"
