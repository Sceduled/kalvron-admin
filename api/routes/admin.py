from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from core.database import get_db
from core.config import settings
from core.models import ClientRegistry, ClientEvent
from api.routes.auth import get_admin_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class StatsIngestRequest(BaseModel):
    client_id: str
    client_name: str
    event_type: str
    lead_score: Optional[str] = None
    from_stage: Optional[str] = None
    to_stage: Optional[str] = None
    triggered_by: Optional[str] = None

@router.post("/stats")
async def ingest_stats(
    payload: StatsIngestRequest,
    x_admin_secret: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if not x_admin_secret or x_admin_secret != settings.ADMIN_SECRET:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid admin secret")
    
    try:
        event = ClientEvent(
            client_id=payload.client_id,
            client_name=payload.client_name,
            event_type=payload.event_type,
            lead_score=payload.lead_score,
            from_stage=payload.from_stage,
            to_stage=payload.to_stage,
            triggered_by=payload.triggered_by
        )
        db.add(event)
        
        result = await db.execute(select(ClientRegistry).where(ClientRegistry.client_id == payload.client_id))
        client = result.scalars().first()
        if not client:
            new_client = ClientRegistry(
                client_id=payload.client_id,
                client_name=payload.client_name,
                railway_url="unknown",
                active=True
            )
            db.add(new_client)
            
        await db.commit()
        return {"status": "received"}
    except Exception as e:
        logger.error(f"Error ingesting stats: {e}")
        return {"status": "error"}

class ClientRegisterRequest(BaseModel):
    client_id: str
    client_name: str
    railway_url: str

class ClientUpdateRequest(BaseModel):
    active: Optional[bool] = None
    railway_url: Optional[str] = None

@router.get("/admin/clients")
async def get_clients(db: AsyncSession = Depends(get_db), admin_user: str = Depends(get_admin_user)):
    result = await db.execute(select(ClientRegistry).where(ClientRegistry.active == True))
    clients = result.scalars().all()
    
    response = []
    for c in clients:
        total_leads = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == c.client_id, ClientEvent.event_type == 'lead_created'))).scalar()
        hot_leads = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == c.client_id, ClientEvent.event_type == 'lead_created', ClientEvent.lead_score == 'HOT'))).scalar()
        warm_leads = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == c.client_id, ClientEvent.event_type == 'lead_created', ClientEvent.lead_score == 'WARM'))).scalar()
        cold_leads = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == c.client_id, ClientEvent.event_type == 'lead_created', ClientEvent.lead_score == 'COLD'))).scalar()
        total_closed = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == c.client_id, ClientEvent.event_type == 'closed'))).scalar()
        total_lost = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == c.client_id, ClientEvent.event_type == 'lost'))).scalar()
        total_opted_out = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == c.client_id, ClientEvent.event_type == 'opted_out'))).scalar()
        
        now = datetime.now(timezone.utc)
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        leads_this_week = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == c.client_id, ClientEvent.event_type == 'lead_created', ClientEvent.created_at >= week_ago))).scalar()
        leads_this_month = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == c.client_id, ClientEvent.event_type == 'lead_created', ClientEvent.created_at >= month_ago))).scalar()
        last_event_at = (await db.execute(select(ClientEvent.created_at).where(ClientEvent.client_id == c.client_id).order_by(ClientEvent.created_at.desc()).limit(1))).scalar()
        
        conversion_rate = (total_closed / total_leads * 100) if total_leads > 0 else 0.0
        
        response.append({
            "client_id": c.client_id,
            "client_name": c.client_name,
            "railway_url": c.railway_url,
            "active": c.active,
            "total_leads": total_leads,
            "hot_leads": hot_leads,
            "warm_leads": warm_leads,
            "cold_leads": cold_leads,
            "total_closed": total_closed,
            "total_lost": total_lost,
            "total_opted_out": total_opted_out,
            "leads_this_week": leads_this_week,
            "leads_this_month": leads_this_month,
            "conversion_rate": round(conversion_rate, 2),
            "last_event_at": last_event_at
        })
    return response

@router.get("/admin/clients/{client_id}")
async def get_client_details(client_id: str, db: AsyncSession = Depends(get_db), admin_user: str = Depends(get_admin_user)):
    result = await db.execute(select(ClientRegistry).where(ClientRegistry.client_id == client_id))
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    total_leads = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == client.client_id, ClientEvent.event_type == 'lead_created'))).scalar()
    hot_leads = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == client.client_id, ClientEvent.event_type == 'lead_created', ClientEvent.lead_score == 'HOT'))).scalar()
    warm_leads = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == client.client_id, ClientEvent.event_type == 'lead_created', ClientEvent.lead_score == 'WARM'))).scalar()
    cold_leads = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == client.client_id, ClientEvent.event_type == 'lead_created', ClientEvent.lead_score == 'COLD'))).scalar()
    total_closed = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == client.client_id, ClientEvent.event_type == 'closed'))).scalar()
    total_lost = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == client.client_id, ClientEvent.event_type == 'lost'))).scalar()
    total_opted_out = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == client.client_id, ClientEvent.event_type == 'opted_out'))).scalar()
    
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    leads_this_week = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == client.client_id, ClientEvent.event_type == 'lead_created', ClientEvent.created_at >= week_ago))).scalar()
    leads_this_month = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.client_id == client.client_id, ClientEvent.event_type == 'lead_created', ClientEvent.created_at >= month_ago))).scalar()
    last_event_at = (await db.execute(select(ClientEvent.created_at).where(ClientEvent.client_id == client.client_id).order_by(ClientEvent.created_at.desc()).limit(1))).scalar()
    
    conversion_rate = (total_closed / total_leads * 100) if total_leads > 0 else 0.0

    recent_events_q = await db.execute(select(ClientEvent).where(ClientEvent.client_id == client.client_id).order_by(ClientEvent.created_at.desc()).limit(50))
    recent_events = recent_events_q.scalars().all()
    
    return {
        "client": {
            "client_id": client.client_id,
            "client_name": client.client_name,
            "railway_url": client.railway_url,
            "active": client.active,
            "total_leads": total_leads,
            "hot_leads": hot_leads,
            "warm_leads": warm_leads,
            "cold_leads": cold_leads,
            "total_closed": total_closed,
            "total_lost": total_lost,
            "total_opted_out": total_opted_out,
            "leads_this_week": leads_this_week,
            "leads_this_month": leads_this_month,
            "conversion_rate": round(conversion_rate, 2),
            "last_event_at": last_event_at
        },
        "recent_events": recent_events
    }

@router.get("/admin/clients/{client_id}/stats/daily")
async def get_client_daily_stats(client_id: str, db: AsyncSession = Depends(get_db), admin_user: str = Depends(get_admin_user)):
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    events_q = await db.execute(select(ClientEvent).where(ClientEvent.client_id == client_id, ClientEvent.created_at >= thirty_days_ago))
    events = events_q.scalars().all()
    
    daily_stats = {}
    for i in range(30, -1, -1):
        d = (now - timedelta(days=i)).date().isoformat()
        daily_stats[d] = {"date": d, "leads": 0, "closed": 0}
        
    for e in events:
        if e.created_at:
            d = e.created_at.date().isoformat()
            if d in daily_stats:
                if e.event_type == 'lead_created':
                    daily_stats[d]["leads"] += 1
                elif e.event_type == 'closed':
                    daily_stats[d]["closed"] += 1
                    
    return sorted(list(daily_stats.values()), key=lambda x: x["date"])

@router.post("/admin/clients")
async def register_client(req: ClientRegisterRequest, db: AsyncSession = Depends(get_db), admin_user: str = Depends(get_admin_user)):
    client = ClientRegistry(client_id=req.client_id, client_name=req.client_name, railway_url=req.railway_url)
    db.add(client)
    await db.commit()
    await db.refresh(client)
    return client

@router.patch("/admin/clients/{client_id}")
async def update_client(client_id: str, req: ClientUpdateRequest, db: AsyncSession = Depends(get_db), admin_user: str = Depends(get_admin_user)):
    result = await db.execute(select(ClientRegistry).where(ClientRegistry.client_id == client_id))
    client = result.scalars().first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    if req.active is not None:
        client.active = req.active
    if req.railway_url is not None:
        client.railway_url = req.railway_url
        
    await db.commit()
    await db.refresh(client)
    return client

@router.get("/admin/stats/overview")
async def get_overview(db: AsyncSession = Depends(get_db), admin_user: str = Depends(get_admin_user)):
    total_clients = (await db.execute(select(func.count(ClientRegistry.id)))).scalar()
    active_clients = (await db.execute(select(func.count(ClientRegistry.id)).where(ClientRegistry.active == True))).scalar()
    
    total_leads_all_time = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.event_type == 'lead_created'))).scalar()
    month_ago = datetime.now(timezone.utc) - timedelta(days=30)
    total_leads_this_month = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.event_type == 'lead_created', ClientEvent.created_at >= month_ago))).scalar()
    
    total_closed_all_time = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.event_type == 'closed'))).scalar()
    total_opted_out_all_time = (await db.execute(select(func.count(ClientEvent.id)).where(ClientEvent.event_type == 'opted_out'))).scalar()
    
    avg_conversion_rate = (total_closed_all_time / total_leads_all_time * 100) if total_leads_all_time > 0 else 0.0
    
    top_client_q = await db.execute(select(ClientEvent.client_id, func.count(ClientEvent.id).label('total')).where(ClientEvent.event_type == 'lead_created').group_by(ClientEvent.client_id).order_by(func.count(ClientEvent.id).desc()).limit(1))
    top_c_row = top_client_q.first()
    top_client_by_leads = top_c_row.client_id if top_c_row else None
    
    top_conv_q = await db.execute(select(ClientEvent.client_id, func.count(ClientEvent.id).label('total')).where(ClientEvent.event_type == 'closed').group_by(ClientEvent.client_id).order_by(func.count(ClientEvent.id).desc()).limit(1))
    top_conv_row = top_conv_q.first()
    top_client_by_conversion = top_conv_row.client_id if top_conv_row else None
    
    return {
        "total_clients": total_clients,
        "active_clients": active_clients,
        "total_leads_all_time": total_leads_all_time,
        "total_leads_this_month": total_leads_this_month,
        "total_closed_all_time": total_closed_all_time,
        "total_opted_out_all_time": total_opted_out_all_time,
        "avg_conversion_rate": round(avg_conversion_rate, 2),
        "top_client_by_leads": top_client_by_leads,
        "top_client_by_conversion": top_client_by_conversion
    }
