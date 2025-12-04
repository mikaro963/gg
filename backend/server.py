from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production-please')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

security = HTTPBearer()

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============= Models =============
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    language: Literal["ar", "en"] = "ar"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: Literal["user", "admin"] = "user"
    language: str = "ar"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserInDB(User):
    password_hash: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Wallet(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    currency: Literal["USD", "USDT", "SYP", "TRY"]
    balance: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: Literal["deposit", "withdrawal", "exchange"]
    amount: float
    currency: str
    status: Literal["pending", "completed", "failed"] = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============= Auth Utilities =============
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user_doc is None:
        raise credentials_exception
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    return User(**user_doc)

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user


# ============= Auth Routes =============
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = UserInDB(
        email=user_data.email,
        name=user_data.name,
        password_hash=get_password_hash(user_data.password),
        language=user_data.language,
        role="user"
    )
    
    user_dict = user.model_dump()
    user_dict['created_at'] = user_dict['created_at'].isoformat()
    await db.users.insert_one(user_dict)
    
    # Create wallets for all currencies
    currencies = ["USD", "USDT", "SYP", "TRY"]
    for currency in currencies:
        wallet = Wallet(user_id=user.id, currency=currency)
        wallet_dict = wallet.model_dump()
        wallet_dict['created_at'] = wallet_dict['created_at'].isoformat()
        wallet_dict['updated_at'] = wallet_dict['updated_at'].isoformat()
        await db.wallets.insert_one(wallet_dict)
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    
    user_response = User(**user.model_dump())
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(credentials.password, user_doc['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if isinstance(user_doc['created_at'], str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ============= User Routes =============
@api_router.get("/user/profile", response_model=User)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.get("/user/wallets")
async def get_user_wallets(current_user: User = Depends(get_current_user)):
    wallets = await db.wallets.find({"user_id": current_user.id}, {"_id": 0}).to_list(100)
    
    for wallet in wallets:
        if isinstance(wallet.get('created_at'), str):
            wallet['created_at'] = datetime.fromisoformat(wallet['created_at'])
        if isinstance(wallet.get('updated_at'), str):
            wallet['updated_at'] = datetime.fromisoformat(wallet['updated_at'])
    
    return wallets

@api_router.get("/user/transactions")
async def get_user_transactions(current_user: User = Depends(get_current_user)):
    transactions = await db.transactions.find({"user_id": current_user.id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for tx in transactions:
        if isinstance(tx.get('created_at'), str):
            tx['created_at'] = datetime.fromisoformat(tx['created_at'])
    
    return transactions


# ============= Admin Routes =============
@api_router.get("/admin/dashboard-stats")
async def get_dashboard_stats(current_admin: User = Depends(get_current_admin)):
    # Get counts
    total_users = await db.users.count_documents({"role": "user"})
    total_transactions = await db.transactions.count_documents({})
    pending_transactions = await db.transactions.count_documents({"status": "pending"})
    
    # Get balances by currency
    currencies = ["USD", "USDT", "SYP", "TRY"]
    currency_balances = {}
    
    for currency in currencies:
        pipeline = [
            {"$match": {"currency": currency}},
            {"$group": {"_id": None, "total": {"$sum": "$balance"}}}
        ]
        result = await db.wallets.aggregate(pipeline).to_list(1)
        currency_balances[currency] = result[0]['total'] if result else 0.0
    
    # Get completed deposits/withdrawals
    completed_deposits = await db.transactions.count_documents({"type": "deposit", "status": "completed"})
    completed_withdrawals = await db.transactions.count_documents({"type": "withdrawal", "status": "completed"})
    
    return {
        "total_users": total_users,
        "new_users_today": 0,  # Will implement later
        "pending_transactions": pending_transactions,
        "completed_deposits": completed_deposits,
        "completed_withdrawals": completed_withdrawals,
        "currency_balances": currency_balances,
        "profits": {
            "USD": 0.0,
            "USDT": 0.0,
            "SYP": 0.0,
            "TRY": 0.0
        }
    }

@api_router.get("/admin/users")
async def get_all_users(current_admin: User = Depends(get_current_admin)):
    users = await db.users.find({"role": "user"}, {"_id": 0, "password_hash": 0}).to_list(1000)
    
    for user in users:
        if isinstance(user.get('created_at'), str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return users

@api_router.get("/admin/wallets")
async def get_all_wallets(current_admin: User = Depends(get_current_admin)):
    wallets = await db.wallets.find({}, {"_id": 0}).to_list(10000)
    
    for wallet in wallets:
        if isinstance(wallet.get('created_at'), str):
            wallet['created_at'] = datetime.fromisoformat(wallet['created_at'])
        if isinstance(wallet.get('updated_at'), str):
            wallet['updated_at'] = datetime.fromisoformat(wallet['updated_at'])
    
    return wallets

@api_router.get("/admin/transactions")
async def get_all_transactions(current_admin: User = Depends(get_current_admin)):
    transactions = await db.transactions.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for tx in transactions:
        if isinstance(tx.get('created_at'), str):
            tx['created_at'] = datetime.fromisoformat(tx['created_at'])
    
    return transactions


# ============= Utility Routes =============
@api_router.post("/init-admin")
async def init_admin():
    """Create initial admin user"""
    existing_admin = await db.users.find_one({"role": "admin"})
    if existing_admin:
        return {"message": "Admin already exists"}
    
    admin = UserInDB(
        email="admin@cashwallet.com",
        name="Admin",
        password_hash=get_password_hash("admin123"),
        role="admin",
        language="ar"
    )
    
    admin_dict = admin.model_dump()
    admin_dict['created_at'] = admin_dict['created_at'].isoformat()
    await db.users.insert_one(admin_dict)
    
    return {"message": "Admin created", "email": "admin@cashwallet.com", "password": "admin123"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()