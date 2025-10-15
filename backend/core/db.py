import motor.motor_asyncio
from beanie import init_beanie
from core.config import settings
from documents import User, Task
from documents import User, DailyLog

async def init_db():
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.DATABASE_URL)
    
    await init_beanie(
        database=client.get_database(settings.DATABASE_NAME),
        document_models=[User, DailyLog] 
    )