import asyncio

class NotificationService:

    def __init__(self):
        self.listeners = []

    async def subscribe(self):
        queue = asyncio.Queue()
        self.listeners.append(queue)
        try:
            while True:
                message = await queue.get()
                yield message
        finally:
            self.listeners.remove(queue)

    async def notify(self, message: str):
        for listener in self.listeners:
            await listener.put(message)

notifier = NotificationService()
