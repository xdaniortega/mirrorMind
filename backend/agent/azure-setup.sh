# These steps should only be executed once.
# This is already setup, storing as a guide in case we need to repeat/migrate/change anything
# Using france as region, due hackathon location

# Main resource group
az group create --name mirrormind-rg --location francecentral

# Environment to run the containerapps.
az containerapp env create \
  --name mirrormind-env \
  --resource-group mirrormind-rg \
  --location francecentral
