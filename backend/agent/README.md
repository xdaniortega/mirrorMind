# README.md

### How to run this project

Add your keys to `.env` file

``` 
ANTHROPIC_API_KEY=anthropic-key
OPENAI_API_KEY=openaiapi-key (Optional)
AGENTVERSE_API_KEY=agentverse-key
TAVILY_API_KEY=tavily-key
```

``` sh
python3 -m venv .env
source .env/bin/activate
pip install -r requirements.txt
python mirror-mind-server.py
```
