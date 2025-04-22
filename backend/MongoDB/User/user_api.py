from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

# Import User và UserDAL từ user_dal.py
from MongoDB.User.user_dal import User, UserDAL
# Import dependency get_user_dal từ server_mongo.py
from MongoDB.server_mongo import get_user_dal

# Khởi tạo router riêng cho user API
router = APIRouter(
    prefix="/users",  # Đặt prefix /users cho các API của user
    tags=["users"]    # Gắn tag "users" để nhóm API trong docs
)

# === Pydantic Models ===
class NewUser(BaseModel):
    name: str
    email: str
    password: str
    username_adafruit: str
    key_adafruit: str

class NewUserResponse(BaseModel):
    id: str
    name: str

class UserUpdate(BaseModel):
    name: str
    email: str
    password: str
    username_adafruit: str
    key_adafruit: str

# === API Endpoints ===
@router.get("") # Đường dẫn tương đối với prefix là "/" -> "/api/users"
async def get_all_users(user_dal: UserDAL = Depends(get_user_dal)) -> list[User]:
    """Lấy danh sách tất cả người dùng."""
    return [i async for i in user_dal.list_users()]

@router.post("", status_code=status.HTTP_201_CREATED) # Đường dẫn: "/api/users"
async def create_user(new_user: NewUser, user_dal: UserDAL = Depends(get_user_dal)) -> NewUserResponse:
    """Tạo một người dùng mới."""
    created_user = await user_dal.create_user(
        name=new_user.name,
        email=new_user.email,
        password=new_user.password, # Cần xem xét mã hóa mật khẩu ở đây
        username_adafruit=new_user.username_adafruit,
        key_adafruit=new_user.key_adafruit
    )
    if not created_user:
        raise HTTPException(status_code=500, detail="Không thể tạo người dùng.")
    return NewUserResponse(
        id=created_user.id,
        name=created_user.name,
    )

@router.get("/{user_no}") # Đường dẫn: "/api/users/{user_no}"
async def get_user(user_no: int, user_dal: UserDAL = Depends(get_user_dal)) -> User:
    """Lấy thông tin một người dùng cụ thể bằng 'no'."""
    user = await user_dal.get_user(user_no)
    if user is None:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy người dùng với no={user_no}")
    return user

@router.patch("/{user_no}") # Đường dẫn: "/api/users/{user_no}"
async def update_user(user_no: int, user_update: UserUpdate, user_dal: UserDAL = Depends(get_user_dal)) -> User:
    """Cập nhật thông tin người dùng."""
    # Tạo một dictionary từ dữ liệu cập nhật thay vì đối tượng User
    user_data = {
        "name": user_update.name,
        "email": user_update.email,
        "password": user_update.password, # Cần xem xét mã hóa mật khẩu
        "username_adafruit": user_update.username_adafruit,
        "key_adafruit": user_update.key_adafruit
    }
    
    updated_user = await user_dal.update_user(user_no, user_data)
    if updated_user is None:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy người dùng với no={user_no} để cập nhật")
    return updated_user

@router.delete("/{user_no}", status_code=status.HTTP_204_NO_CONTENT) # Đường dẫn: "/api/users/{user_no}"
async def delete_user(user_no: int, user_dal: UserDAL = Depends(get_user_dal)):
    """Xóa người dùng."""
    deleted = await user_dal.delete_user(user_no)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy người dùng với no={user_no} để xóa")
    # Trả về status 204 khi thành công và không có nội dung body
    return None