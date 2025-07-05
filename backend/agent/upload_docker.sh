set -e
docker build -t adriacarraquilla/mirrormind:latest .
docker tag adriacarraquilla/mirrormind:latest mirrormindregistry.azurecr.io/mirrormind-agent:latest
docker push mirrormindregistry.azurecr.io/mirrormind-agent:latest
