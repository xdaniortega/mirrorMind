FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy the contents of the src folder into the container
COPY ./app .

# Install Python packages
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

EXPOSE 5000 8000 8080 26657 26658

CMD ["python", "mirror-mind-server.py"]
