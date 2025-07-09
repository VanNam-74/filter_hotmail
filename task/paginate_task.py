
from api.HotmailApi import HotmailApi
from fastapi.responses import JSONResponse


hotmailApi = HotmailApi()

async def paginate_task(request, page: int = 1):
    data_table = await hotmailApi.get_profile_paginate(page)
    print(f"Paginate Task: {data_table}")
    return JSONResponse(
        content={
            "result":data_table
        }
    )