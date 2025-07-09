
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import FastAPI, Request
import requests
import time
from fastapi.responses import JSONResponse, HTMLResponse
from api.HotmailApi import HotmailApi

hotmail_api = HotmailApi()
page = 1
limit = 5
async def search_profile_task(request):



    result_search = await hotmail_api.search_profile(request)

    return JSONResponse(
        content={
            'total':len(result_search),
            'page':page,
            'limit':limit,
            'data':result_search
        }
    )
    