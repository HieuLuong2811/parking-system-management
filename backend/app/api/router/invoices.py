from app.authen.current_user import required_roles
from app.models.auth import AuthUser
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.controller.invoices import InvoiceController
from app.db.session import get_db
from app.models.responses import DeleteResponse
from app.models.invoices import InvoiceCreate, InvoiceRead, InvoiceUpdate

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.post("/", response_model=InvoiceRead)
async def create_invoice(payload: InvoiceCreate, db: AsyncSession = Depends(get_db), current_user: AuthUser = Depends(required_roles("USER", "SECURITY"))):
    return await InvoiceController.create_invoice_ctrl(payload, db)


@router.get("/", response_model=list[InvoiceRead])
async def list_invoices(db: AsyncSession = Depends(get_db), current_user: AuthUser = Depends(required_roles("USER", "ADMIN"))):
    invoices = await InvoiceController.get_all_invoices_ctrl(db)
    if not invoices:
        raise HTTPException(status_code=404, detail="No invoices found")
    return invoices


@router.get("/{user_id}", response_model=InvoiceRead)
async def get_invoice(user_id: str, db: AsyncSession = Depends(get_db), current_user: AuthUser = Depends(required_roles("USER", "SECURITY"))):
    return await InvoiceController.get_invoice_by_user_code_ctrl(user_id, db)


@router.patch("/{invoice_id}", response_model=InvoiceRead)
async def update_invoice(
    invoice_id: str, payload: InvoiceUpdate, db: AsyncSession = Depends(get_db), current_user: AuthUser = Depends(required_roles("USER"))
):
    return await InvoiceController.update_invoice_ctrl(invoice_id, payload, db)
