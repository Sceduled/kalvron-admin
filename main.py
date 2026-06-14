from fastapi import FastAPI

app = FastAPI(title="Kalvron Admin API")

@app.get("/")
def read_root():
    return {"message": "Welcome to Kalvron Admin API"}
