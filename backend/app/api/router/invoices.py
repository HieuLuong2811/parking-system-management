from app.authen.current_user import is_admin_user, required_roles
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
async def list_invoices(db: AsyncSession = Depends(get_db), current_user: AuthUser = Depends(required_roles("ADMIN"))):
    return await InvoiceController.get_all_invoices_ctrl(db)


@router.get("/me", response_model=list[InvoiceRead])
async def list_user_invoices(
    db: AsyncSession = Depends(get_db),
    current_user: AuthUser = Depends(required_roles("USER", "ADMIN")),
):
    return await InvoiceController.get_invoices_by_user_ctrl(current_user.user_code, db)


@router.get("/{user_code}", response_model=InvoiceRead)
async def get_invoice(user_code: str, db: AsyncSession = Depends(get_db), current_user: AuthUser = Depends(required_roles("USER", "SECURITY"))):
    if user_code != current_user.user_code and not is_admin_user(current_user):
        raise HTTPException(status_code=403, detail="Forbidden")
    return await InvoiceController.get_invoice_by_user_code_ctrl(user_code, db)


@router.patch("/{invoice_id}", response_model=InvoiceRead)
async def update_invoice(
    invoice_id: str, payload: InvoiceUpdate, db: AsyncSession = Depends(get_db), current_user: AuthUser = Depends(required_roles("USER"))
):
    return await InvoiceController.update_invoice_ctrl(invoice_id, payload, db)
