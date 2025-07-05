#!/bin/bash
set -e

# constants
ACR_NAME="mirrormindregistry"
IMAGE_NAME="mirrormind-agent"
IMAGE_TAG="latest"
ACR_IMAGE="$ACR_NAME.azurecr.io/$IMAGE_NAME:$IMAGE_TAG"

RESOURCE_GROUP="mirrormind-rg"
ENVIRONMENT_NAME="mirrormind-env"
COMPOSE_FILE="docker-compose.yml"

APPS=("mirror-agent-alpha" "mirror-agent-beta")

# Secret keys (from .env or hardcoded)
AGENTVERSE_API_KEY=$(grep AGENTVERSE_API_KEY .env | cut -d '=' -f2)
ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env | cut -d '=' -f2)

# Create container resources (only need to do once)
create_container_apps() {
  echo "Creating container apps using docker-compose..."
  az containerapp compose create \
    --resource-group "$RESOURCE_GROUP" \
    --environment "$ENVIRONMENT_NAME" \
    --registry-server "$ACR_NAME.azurecr.io" \
    --registry-username "$(az acr credential show --name "$ACR_NAME" --query username -o tsv)" \
    --registry-password "$(az acr credential show --name "$ACR_NAME" --query 'passwords[0].value' -o tsv)" \
    --compose-file-path "$COMPOSE_FILE"
}

# For secret env keys, we use containerapp secret.
# The container needs to be running to upload them,
# so we need to restart them with the update command
set_secrets() {
  for APP_NAME in "${APPS[@]}"; do
    echo "Setting secrets for $APP_NAME..."
    az containerapp secret set \
      --name "$APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --secrets \
        agentverse-api-key="$AGENTVERSE_API_KEY" \
        anthropic-api-key="$ANTHROPIC_API_KEY"

    az containerapp update \
      --name "$APP_NAME" \
      --resource-group "$RESOURCE_GROUP" \
      --set-env-vars \
        AGENTVERSE_API_KEY=secretref:agentverse-api-key \
        ANTHROPIC_API_KEY=secretref:anthropic-api-key
  done
}

# Build and update image in ACR
build_and_push_image() {
  echo "Building Docker image..."
  docker build -t "$ACR_IMAGE" .

  echo "Logging in and pushing image to ACR..."
  az acr login --name "$ACR_NAME"
  docker push "$ACR_IMAGE"
}

# Restart containers when redeploying changes
restart_apps() {
  for APP_NAME in "${APPS[@]}"; do
    echo "🔁 Restarting $APP_NAME..."
    az containerapp revision restart \
      --name "$APP_NAME" \
      --resource-group "$RESOURCE_GROUP"
  done
}


MODE=$1

if [[ -z "$MODE" ]]; then
  echo "Please provide a mode: create | update"
  exit 1
fi

echo "Starting deployment in '$MODE' mode..."

build_and_push_image

if [[ "$MODE" == "create" ]]; then
  create_container_apps
  set_secrets
elif [[ "$MODE" == "update" ]]; then
  set_secrets
  restart_apps
else
  echo "❌ Unknown mode: $MODE"
  exit 1
fi

echo "✅ Deployment completed successfully!"
