import asyncio


class NotificationService:
    def __init__(self):
        self.listeners = []

    async def subscribe(self):
        queue = asyncio.Queue()
        self.listeners.append(queue)
        try:
            while True:
                event = await queue.get()
                yield event
        finally:
            self.listeners.remove(queue)

    async def notify(self, event: dict):
        for listener in self.listeners:
            await listener.put(event)

notifier = NotificationService()
