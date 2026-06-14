from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy import String, Boolean, DateTime, func, Text, Index
import uuid
from datetime import datetime

Base = declarative_base()

class ClientRegistry(Base):
    __tablename__ = "client_registry"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    client_id: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    client_name: Mapped[str] = mapped_column(Text, nullable=False)
    railway_url: Mapped[str] = mapped_column(Text, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

class ClientEvent(Base):
    __tablename__ = "client_events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    client_id: Mapped[str] = mapped_column(Text, nullable=False)
    client_name: Mapped[str] = mapped_column(Text, nullable=False)
    event_type: Mapped[str] = mapped_column(Text, nullable=False)
    lead_score: Mapped[str | None] = mapped_column(Text, nullable=True)
    from_stage: Mapped[str | None] = mapped_column(Text, nullable=True)
    to_stage: Mapped[str | None] = mapped_column(Text, nullable=True)
    triggered_by: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_client_events_client_id_created_at', 'client_id', 'created_at', postgresql_using='btree'),
        Index('idx_client_events_event_type_created_at', 'event_type', 'created_at', postgresql_using='btree'),
    )
