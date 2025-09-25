from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os, json, logging

app = FastAPI()

# CORS: dev on localhost:5173, prod on any *.azuredatabricks.net / *.databricksapps.com
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing
    allow_origin_regex=None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PRODUCTS_PATH = os.path.join(
    os.path.dirname(__file__),
    'dataProducts.json'
)

def read_data_products():
    try:
        with open(DATA_PRODUCTS_PATH, 'r') as f:
            return json.load(f)
    except Exception as e:
        logging.exception('Error reading dataProducts.json')
        raise HTTPException(status_code=500, detail=f'Error reading dataProducts.json: {e}')

def write_data_products(products):
    with open(DATA_PRODUCTS_PATH, 'w') as f:
        json.dump(products, f, indent=4)

@app.get('/api/data-products')
def get_data_products():
    return read_data_products()

@app.put('/api/data-products')
async def update_data_products(request: Request):
    products = await request.json()
    write_data_products(products)
    return {"status": "success"}

# serve React build from /static
app.mount("/", StaticFiles(directory="static", html=True), name="site")
