from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pipeline import process_image
import cv2
import numpy as np
import urllib.request
from typing import Dict, Any

app = FastAPI(
    title="Computational Epigraphy AI API",
    description="Multi-stage AI research assistant for ancient script analysis & computational decipherment."
)

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Computational Epigraphy AI Pipeline",
        "version": "2.0-research",
        "scientific_disclaimer": "This service distinguishes between Observed measurements, ML Predictions, Corpus Evidence, and Interpretive Hypotheses."
    }

@app.post("/analyze")
async def analyze_script(file: UploadFile = File(None), url: str = Form(None)) -> Dict[str, Any]:
    if file is not None:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    elif url is not None:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                nparr = np.asarray(bytearray(response.read()), dtype="uint8")
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not load image from URL: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Must provide either an image file or a URL")
    
    if img is None:
        raise HTTPException(status_code=400, detail="Failed to decode image raster")
         
    # Process through research epigraphy pipeline
    result = process_image(img)
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
