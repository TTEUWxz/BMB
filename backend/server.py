from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from enum import Enum
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    description: str
    price: float
    duration_minutes: int
    image_url: str

class TimeSlot(BaseModel):
    time: str
    available: bool

class BookingCreate(BaseModel):
    service_id: str
    customer_name: str = Field(..., min_length=1)
    customer_phone: str = Field(..., min_length=1)
    customer_email: str = Field(..., min_length=1)
    vehicle_model: str = Field(..., min_length=1)
    vehicle_plate: str = Field(..., min_length=1)
    date: str
    time: str

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    service_id: str
    service_name: str
    customer_name: str
    customer_phone: str
    customer_email: str
    vehicle_model: str
    vehicle_plate: str
    date: str
    time: str
    status: BookingStatus
    created_at: str

class BookingUpdate(BaseModel):
    status: BookingStatus

# Notification functions
def send_email_notification(to_email: str, subject: str, body: str):
    """Send email notification - temporary solution"""
    try:
        # Get email configuration from environment
        smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_user = os.environ.get('SMTP_USER', '')
        smtp_password = os.environ.get('SMTP_PASSWORD', '')
        from_email = os.environ.get('FROM_EMAIL', smtp_user)
        
        if not smtp_user or not smtp_password:
            logger.warning("SMTP credentials not configured. Email not sent.")
            return False
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = to_email
        
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                {body}
            </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

def send_whatsapp_notification(phone_number: str, message: str):
    """Send WhatsApp notification via Twilio - placeholder for future implementation"""
    # TODO: Implement Twilio WhatsApp API when credentials are available
    # For now, log the message
    logger.info(f"WhatsApp notification (placeholder) to {phone_number}: {message}")
    return True

def format_booking_notification(booking: dict, notification_type: str = "owner"):
    """Format booking information for notifications"""
    date_formatted = datetime.fromisoformat(booking['date'] + 'T00:00:00').strftime('%d/%m/%Y')
    
    if notification_type == "owner":
        subject = f"🚗 Novo Agendamento - BMB ESTÉTICA AUTOMOTIVA"
        body = f"""
        <div style="background: #f4f4f5; padding: 20px; border-radius: 8px;">
            <h2 style="color: #3b82f6;">Novo Agendamento Recebido!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #18181b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Detalhes do Serviço</h3>
                <p><strong>Serviço:</strong> {booking['service_name']}</p>
                <p><strong>Data:</strong> {date_formatted}</p>
                <p><strong>Horário:</strong> {booking['time']}</p>
                <p><strong>Status:</strong> Pendente</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #18181b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Dados do Cliente</h3>
                <p><strong>Nome:</strong> {booking['customer_name']}</p>
                <p><strong>Telefone:</strong> {booking['customer_phone']}</p>
                <p><strong>Email:</strong> {booking['customer_email']}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #18181b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Dados do Veículo</h3>
                <p><strong>Modelo:</strong> {booking['vehicle_model']}</p>
                <p><strong>Placa:</strong> {booking['vehicle_plate']}</p>
            </div>
            
            <p style="color: #71717a; font-size: 12px; margin-top: 20px;">
                ID do Agendamento: {booking['id']}
            </p>
        </div>
        """
    else:  # customer
        subject = f"✅ Agendamento Confirmado - BMB ESTÉTICA AUTOMOTIVA"
        body = f"""
        <div style="background: #f4f4f5; padding: 20px; border-radius: 8px;">
            <h2 style="color: #3b82f6;">Agendamento Realizado com Sucesso!</h2>
            <p>Olá, <strong>{booking['customer_name']}</strong>!</p>
            <p>Seu agendamento foi confirmado. Seguem os detalhes:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #18181b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Detalhes do Agendamento</h3>
                <p><strong>Serviço:</strong> {booking['service_name']}</p>
                <p><strong>Data:</strong> {date_formatted}</p>
                <p><strong>Horário:</strong> {booking['time']}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #18181b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Localização</h3>
                <p><strong>📍 RUA JUIZ JACOB GOLDEMBERG, 4</strong></p>
            </div>
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <p style="margin: 0;"><strong>Importante:</strong> Chegue com 10 minutos de antecedência.</p>
            </div>
            
            <p style="color: #71717a; font-size: 12px; margin-top: 20px;">
                ID do Agendamento: {booking['id']}<br>
                BMB ESTÉTICA AUTOMOTIVA - Transformando seu veículo com excelência
            </p>
        </div>
        """
    
    return subject, body

@api_router.get("/")
async def root():
    return {"message": "BMB ESTÉTICA AUTOMOTIVA API"}

@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find({}, {"_id": 0}).to_list(100)
    return services

@api_router.get("/timeslots")
async def get_timeslots(date: str):
    working_hours = [
        "08:00", "09:00", "10:00", "11:00",
        "13:00", "14:00", "15:00", "16:00", "17:00"
    ]
    
    bookings = await db.bookings.find(
        {"date": date, "status": {"$in": ["pending", "confirmed"]}},
        {"_id": 0, "time": 1}
    ).to_list(100)
    
    booked_times = [b["time"] for b in bookings]
    
    timeslots = [
        {"time": time, "available": time not in booked_times}
        for time in working_hours
    ]
    
    return timeslots

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, background_tasks: BackgroundTasks):
    service = await db.services.find_one({"id": booking_data.service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    
    existing = await db.bookings.find_one({
        "date": booking_data.date,
        "time": booking_data.time,
        "status": {"$in": ["pending", "confirmed"]}
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Horário não disponível")
    
    from uuid import uuid4
    booking_id = str(uuid4())
    
    booking = Booking(
        id=booking_id,
        service_id=booking_data.service_id,
        service_name=service["name"],
        customer_name=booking_data.customer_name,
        customer_phone=booking_data.customer_phone,
        customer_email=booking_data.customer_email,
        vehicle_model=booking_data.vehicle_model,
        vehicle_plate=booking_data.vehicle_plate,
        date=booking_data.date,
        time=booking_data.time,
        status=BookingStatus.PENDING,
        created_at=datetime.now(timezone.utc).isoformat()
    )
    
    await db.bookings.insert_one(booking.model_dump())
    
    # Send notifications in background
    booking_dict = booking.model_dump()
    
    # Notification to owner
    owner_phone = os.environ.get('OWNER_WHATSAPP', '+5521992739496')
    owner_email = os.environ.get('OWNER_EMAIL', '')
    
    if owner_email:
        subject, body = format_booking_notification(booking_dict, "owner")
        background_tasks.add_task(send_email_notification, owner_email, subject, body)
    
    # WhatsApp notification placeholder (will be implemented with Twilio)
    whatsapp_message = f"""
🚗 *Novo Agendamento - BMB ESTÉTICA AUTOMOTIVA*

*Serviço:* {booking_dict['service_name']}
*Data:* {booking_dict['date']}
*Horário:* {booking_dict['time']}

*Cliente:* {booking_dict['customer_name']}
*Telefone:* {booking_dict['customer_phone']}
*Veículo:* {booking_dict['vehicle_model']} - {booking_dict['vehicle_plate']}

ID: {booking_dict['id']}
"""
    background_tasks.add_task(send_whatsapp_notification, owner_phone, whatsapp_message)
    
    # Notification to customer
    subject, body = format_booking_notification(booking_dict, "customer")
    background_tasks.add_task(send_email_notification, booking_data.customer_email, subject, body)
    
    # Customer WhatsApp notification
    customer_whatsapp_message = f"""
✅ *Agendamento Confirmado - BMB ESTÉTICA AUTOMOTIVA*

Olá *{booking_dict['customer_name']}*!

*Serviço:* {booking_dict['service_name']}
*Data:* {booking_dict['date']}
*Horário:* {booking_dict['time']}

📍 *Local:* RUA JUIZ JACOB GOLDEMBERG, 4

Chegue com 10 minutos de antecedência.

ID: {booking_dict['id']}
"""
    background_tasks.add_task(send_whatsapp_notification, booking_data.customer_phone, customer_whatsapp_message)
    
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    
    bookings = await db.bookings.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bookings

@api_router.get("/bookings/{booking_id}", response_model=Booking)
async def get_booking(booking_id: str):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return booking

@api_router.patch("/bookings/{booking_id}", response_model=Booking)
async def update_booking(booking_id: str, update_data: BookingUpdate):
    result = await db.bookings.find_one_and_update(
        {"id": booking_id},
        {"$set": {"status": update_data.status}},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    
    result.pop("_id", None)
    return Booking(**result)

@api_router.post("/init-services")
async def init_services():
    # Use upsert to prevent duplicates - only insert if service doesn't exist
    services = [
        {
            "id": "lavagem-simples",
            "name": "Lavagem Simples",
            "description": "Lavagem externa completa do veículo com produtos de qualidade",
            "price": 50.00,
            "duration_minutes": 30,
            "image_url": "https://images.pexels.com/photos/6872158/pexels-photo-6872158.jpeg"
        },
        {
            "id": "lavagem-detalhada",
            "name": "Lavagem Detalhada",
            "description": "Lavagem completa interna e externa com aspiração e limpeza profunda",
            "price": 120.00,
            "duration_minutes": 90,
            "image_url": "https://images.pexels.com/photos/16376825/pexels-photo-16376825.jpeg"
        },
        {
            "id": "revitalizacao-plasticos",
            "name": "Revitalização dos Plásticos",
            "description": "Restauração e proteção dos plásticos internos e externos",
            "price": 80.00,
            "duration_minutes": 60,
            "image_url": "https://images.pexels.com/photos/5158181/pexels-photo-5158181.jpeg"
        },
        {
            "id": "higienizacao-estofados",
            "name": "Higienização Interna nos Estofados",
            "description": "Limpeza profunda e higienização completa dos estofados com produtos especializados",
            "price": 150.00,
            "duration_minutes": 90,
            "image_url": "https://images.pexels.com/photos/16376825/pexels-photo-16376825.jpeg"
        }
    ]
    
    # Use upsert for each service to prevent duplicates
    from pymongo import UpdateOne
    operations = [
        UpdateOne(
            {"id": service["id"]},
            {"$set": service},
            upsert=True
        )
        for service in services
    ]
    
    if operations:
        await db.services.bulk_write(operations)
    
    return {"message": "Serviços inicializados com sucesso", "count": len(services)}

class NotificationConfig(BaseModel):
    owner_email: str
    owner_whatsapp: str = "+5521992739496"
    smtp_user: str
    smtp_password: str
    smtp_server: str = "smtp.gmail.com"
    smtp_port: str = "587"

@api_router.get("/notification-config")
async def get_notification_config():
    """Get current notification configuration status"""
    owner_email = os.environ.get('OWNER_EMAIL', '')
    smtp_user = os.environ.get('SMTP_USER', '')
    
    return {
        "email_configured": bool(owner_email and smtp_user),
        "owner_email": owner_email if owner_email else None,
        "smtp_user": smtp_user if smtp_user else None,
        "owner_whatsapp": os.environ.get('OWNER_WHATSAPP', '+5521992739496')
    }

@api_router.post("/notification-config")
async def save_notification_config(config: NotificationConfig, background_tasks: BackgroundTasks):
    """Save notification configuration to .env file"""
    try:
        env_path = ROOT_DIR / '.env'
        
        # Read current .env
        env_lines = []
        if env_path.exists():
            with open(env_path, 'r') as f:
                env_lines = f.readlines()
        
        # Update or add configuration
        config_keys = {
            'OWNER_EMAIL': config.owner_email,
            'OWNER_WHATSAPP': config.owner_whatsapp,
            'SMTP_USER': config.smtp_user,
            'SMTP_PASSWORD': config.smtp_password,
            'SMTP_SERVER': config.smtp_server,
            'SMTP_PORT': config.smtp_port,
            'FROM_EMAIL': config.smtp_user
        }
        
        # Create updated lines
        updated_keys = set()
        new_lines = []
        
        for line in env_lines:
            line = line.strip()
            if not line or line.startswith('#'):
                new_lines.append(line)
                continue
            
            key = line.split('=')[0].strip()
            if key in config_keys:
                new_lines.append(f'{key}="{config_keys[key]}"')
                updated_keys.add(key)
            else:
                new_lines.append(line)
        
        # Add missing keys
        for key, value in config_keys.items():
            if key not in updated_keys:
                new_lines.append(f'{key}="{value}"')
        
        # Write back to .env
        with open(env_path, 'w') as f:
            f.write('\n'.join(new_lines) + '\n')
        
        logger.info("Notification configuration updated successfully")
        
        # Schedule backend restart in background
        def restart_backend():
            import subprocess
            import time
            time.sleep(1)
            subprocess.run(['sudo', 'supervisorctl', 'restart', 'backend'])
        
        background_tasks.add_task(restart_backend)
        
        return {"message": "Configuração salva com sucesso. Backend será reiniciado.", "success": True}
        
    except Exception as e:
        logger.error(f"Error saving notification config: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao salvar configuração: {str(e)}")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()