import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.services.notification_service import notifier

router = APIRouter(prefix="/api/events", tags=["events"])


# ============================================================
# GET /api/events/stream
# ============================================================


@router.get("/stream")
async def stream_events():
    async def event_generator():
        async for event in notifier.subscribe():
            yield f"data: {json.dumps(event)}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")
