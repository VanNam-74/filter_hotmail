from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import uvicorn
import threading
import webview
import requests
from task.search_task import search_profile_task
from task.paginate_task import paginate_task
from pydantic import BaseModel
from typing import List
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI,Request, UploadFile, File, Query
import sys
import os


app = FastAPI()
API_HOST = "http://192.168.1.104:8000"

def get_base_path():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    else:
        return os.path.abspath(".")

def get_templates_path():
    return os.path.join(get_base_path(), 'templates')

def get_static_path():
    return os.path.join(get_base_path(), 'static')

templates = Jinja2Templates(directory=get_templates_path())
app.mount("/static", StaticFiles(directory=get_static_path()), name="static")



class SearchRequest(BaseModel):
    profileId: List[str]
    profileName: List[str]
    status: str


@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("main.html", {"request": request})

@app.post("/search__action")
async def search__action(request: SearchRequest):
    return await search_profile_task(request)

@app.get("/paginate_page/{page}")
async def paginate_page(request: Request, page:int, total:int = Query(20), limit:int = Query(20)):
    return await paginate_task(request, page)

@app.get("/get_profile", response_class=JSONResponse)
def get_profiles():
    page = 1
    limit = 5
    api_url = f"{API_HOST}/api/v1/profiles"
    headers = {'content-type': 'application/json'}
    
    try:
        req = requests.get(url=api_url, headers=headers, timeout=10)
        req.raise_for_status()
        if req.status_code == 200:
            data = req.json()
            print(data)
            return JSONResponse(
                content={
                    "total": len(data),
                    "page": page,
                    "limit": limit,
                    "data": data[0:limit]
                }
            )
        else:
            return JSONResponse(content={"error": "Failed to fetch profiles"}, status_code=req.status_code)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching profile data: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

def start_server():
    uvicorn.run(app, host="127.0.0.1", port=5000)

if __name__ == '__main__':
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    webview.create_window("FastAPI + PyWebview App", "http://127.0.0.1:5000",width=1400, height=1000)
    webview.start()
