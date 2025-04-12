from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from datetime import datetime
from pydantic import BaseModel
# Import model và DAL từ user_log_dal.py
from MongoDB.UserLog.user_log_dal import UserLog, UserLogDAL
# Import dependency để lấy UserLogDAL (sẽ được định nghĩa trong server_mongo.py)
from MongoDB.server_mongo import get_user_log_dal

# Khởi tạo router riêng cho user log API
router = APIRouter(
    prefix="/logs",    # Prefix cho các API log
    tags=["user_logs"] # Tag để nhóm API trong docs
)

# === Pydantic Models (Chỉ cần model response vì input được xử lý trực tiếp trong endpoint POST) ===
class UserLogResponse(UserLog): # Kế thừa từ UserLog để có tất cả các trường
    pass

class CreateLogRequest(BaseModel): # Model cho request body khi tạo log
    user_no: int
    activity: str
    status: str
    device_name: Optional[str] = None
    # timestamp không cần truyền, sẽ tự tạo hoặc dùng thời gian hiện tại

# === API Endpoints ===

@router.post("", status_code=status.HTTP_201_CREATED, response_model=UserLogResponse)
async def create_user_log(
    log_request: CreateLogRequest,
    user_log_dal: UserLogDAL = Depends(get_user_log_dal)
):
    """Tạo một bản ghi user log mới."""
    try:
        new_log = await user_log_dal.create_log(
            user_no=log_request.user_no,
            activity=log_request.activity,
            status=log_request.status,
            device_name=log_request.device_name
        )
        return new_log
    except Exception as e:
        # Log lỗi ở đây nếu cần
        raise HTTPException(status_code=500, detail=f"Không thể tạo log: {str(e)}")


@router.get("", response_model=List[UserLogResponse])
async def get_logs(
    user_no: Optional[int] = Query(None, description="Lọc log theo user_no cụ thể"),
    skip: int = Query(0, ge=0, description="Số lượng bản ghi bỏ qua (phân trang)"),
    limit: int = Query(100, ge=1, le=1000, description="Số lượng bản ghi tối đa trả về"),
    user_log_dal: UserLogDAL = Depends(get_user_log_dal)
):
    """
    Lấy danh sách user log.

    - Có thể lọc theo **user_no** cụ thể bằng query parameter.
    - Hỗ trợ phân trang bằng **skip** và **limit**.
    """
    logs = []
    try:
        if user_no is not None:
            # Lấy log cho user cụ thể
            async for log in user_log_dal.get_logs_by_user(user_no, limit=limit, skip=skip):
                logs.append(log)
        else:
            # Lấy tất cả log nếu không có user_no
            async for log in user_log_dal.get_all_logs(limit=limit, skip=skip):
                logs.append(log)
        return logs
    except Exception as e:
        # Log lỗi ở đây nếu cần
        raise HTTPException(status_code=500, detail=f"Không thể lấy danh sách log: {str(e)}")


@router.get("/user/{user_no}", response_model=List[UserLogResponse])
async def get_user_logs_by_user_no(
    user_no: int, # Lấy user_no từ path parameter
    skip: int = Query(0, ge=0, description="Số lượng bản ghi bỏ qua (phân trang)"),
    limit: int = Query(100, ge=1, le=1000, description="Số lượng bản ghi tối đa trả về"),
    user_log_dal: UserLogDAL = Depends(get_user_log_dal)
):
    """
    Lấy danh sách tất cả log cho một user_no cụ thể.

    - Hỗ trợ phân trang bằng **skip** và **limit**.
    """
    logs = []
    try:
        async for log in user_log_dal.get_logs_by_user(user_no, limit=limit, skip=skip):
            logs.append(log)
        # Không cần kiểm tra logs rỗng ở đây, trả về danh sách rỗng là hợp lệ
        return logs
    except Exception as e:
        # Log lỗi ở đây nếu cần
        raise HTTPException(status_code=500, detail=f"Không thể lấy log cho user {user_no}: {str(e)}")


@router.get("/{log_id}", response_model=UserLogResponse)
async def get_single_log(
    log_id: str,
    user_log_dal: UserLogDAL = Depends(get_user_log_dal)
):
    """Lấy thông tin chi tiết của một log bằng ID."""
    try:
        log = await user_log_dal.get_log_by_id(log_id)
        if log is None:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy log với ID: {log_id}")
        return log
    except HTTPException as he:
        raise he # Re-raise HTTPException để giữ nguyên status code và detail
    except Exception as e:
        # Log lỗi ở đây nếu cần
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy log {log_id}: {str(e)}")
