from app.main import app

# Vercel serverless function wrapper
def handler(request, response):
    return app