import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/mcu")

MCU_URL = "http://192.168.0.109/jsonrpc"


@router.post("/image")
async def get_mcu_image():
    payload = {
        "jsonrpc": "2.0",
        "method": "get_image_from_camera",
        "params": {},
        "id": 1
    }

    try:
        async with httpx.AsyncClient(
            timeout=30.0,
            headers={
                "Connection": "close"
            }
        ) as client:
            response = await client.post(
                MCU_URL,
                json=payload
            )

        response.raise_for_status()

        return response.json()

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Error comunicando con el MCU: {str(e)}"
        )



@router.post("/changeMode")
async def change_mode():
    payload = {
        "jsonrpc": "2.0",
        "method": "change_mode",
        "params": {},
        "id": 1
    }

    try:
        async with httpx.AsyncClient(
            timeout=30.0,
            headers={
                "Connection": "close"
            }
        ) as client:
            response = await client.post(
                MCU_URL,
                json=payload
            )

        response.raise_for_status()

        return response.json()

    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Error comunicando con el MCU: {str(e)}"
        )
