
import requests
from typing import List
from pydantic import BaseModel



class HotmailApi:

    API_HOST = "http://192.168.1.104:8000"
    async def search_profile(self, request) :
        API_SEARCH = f"{self.API_HOST}/api/v1/profiles/search"
        profileId = request.profileId
        profileName = request.profileName
        status = request.status
        headers = {
            'content-type':'application/json'
        }
        body = {
            "profileId": profileId,
            "profileName": profileName,
            "status":status
        }
        req = requests.post(url=API_SEARCH, headers=headers, json=body)

        if req.status_code == 200:
            return req.json()
        else:
            return []
        

    async def get_profile_paginate(self, page: int = 1, limit: int = 5):
        API_PAGINATE = f"{self.API_HOST}/api/v1/profiles/paginate_page/{page}"
        headers = {
            'content-type': 'application/json'
        }
        req = requests.get(url=API_PAGINATE, headers=headers)

        if req.status_code == 200:
            return req.json()
        else:
            return []