# -*- coding: utf-8 -*-
"""
FastAPI 主程序
书单/影单管理工具后端 API
"""

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional, List
from .database import get_db, init_db
from .models import Item
from .user_model import User
from .auth import verify_password, get_password_hash, create_access_token, decode_token
from .schemas import (
    ItemCreate, 
    ItemUpdate, 
    ItemResponse, 
    ItemListResponse, 
    StatsResponse, 
    MessageResponse,
    LoginRequest,
    LoginResponse
)

app = FastAPI(
    title="书单/影单管理工具 API",
    description="用于管理书籍和影视作品的后端接口",
    version="1.0.0"
)

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """获取当前登录用户"""
    token = credentials.credentials
    payload = decode_token(token)
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的认证凭据"
        )
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户不存在"
        )
    return user


@app.on_event("startup")
async def startup_event():
    init_db()
    db = next(get_db())
    existing_user = db.query(User).filter(User.username == "admin").first()
    if not existing_user:
        hashed = get_password_hash("123456")
        new_user = User(username="admin", hashed_password=hashed)
        db.add(new_user)
        db.commit()
        print("✅ 默认用户 admin 已创建，密码：123456")
    print("✅ 数据库初始化完成！")


@app.get("/")
async def root():
    return {"message": "欢迎使用书单/影单管理工具 API", "docs": "/docs"}


@app.post("/api/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """用户登录接口"""
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )
    token = create_access_token(data={"sub": user.username})
    return LoginResponse(
        code=200,
        message="登录成功",
        data={"token": token, "username": user.username}
    )


# ==================== 添加记录 ====================
@app.post("/api/items", response_model=MessageResponse)
def create_item(item: ItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    添加新的书单/影单记录
    
    参数：
        - item: ItemCreate 模型，包含必填和可选字段
        - db: 数据库会话（由 Depends 自动注入）
    
    返回：
        - MessageResponse: 包含状态码、消息和新建记录的ID
    """
    # 创建新的数据库记录
    db_item = Item(
        title=item.title,
        category=item.category,
        type=item.type,
        author=item.author,
        director=item.director,
        actor=item.actor,
        rating=item.rating,
        status=item.status,
        remark=item.remark,
        progress=item.progress,
        tags=item.tags
    )
    
    # 添加到数据库会话
    db.add(db_item)
    # 提交事务，保存到数据库
    db.commit()
    # 刷新会话，获取新记录的ID
    db.refresh(db_item)
    
    # 返回成功响应
    return MessageResponse(
        code=201,
        message="添加成功",
        data={"id": db_item.id}
    )


# ==================== 查询记录列表 ====================
@app.get("/api/items", response_model=ItemListResponse)
def get_items(
    category: Optional[str] = Query(None, description="筛选分类：book-书籍, movie-影视"),
    status: Optional[str] = Query(None, description="筛选状态：want, watching, finished"),
    tags: Optional[str] = Query(None, description="筛选标签（精确匹配）"),
    rating: Optional[int] = Query(None, ge=1, le=5, description="筛选评分"),
    sort_by: str = Query("create_time", description="排序字段：create_time, rating, title"),
    order: str = Query("desc", description="排序方向：asc, desc"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取书单/影单记录列表
    
    支持多种筛选和排序方式：
    - 按分类筛选（category）
    - 按状态筛选（status）
    - 按标签筛选（tags）
    - 按评分筛选（rating）
    - 按创建时间/评分/标题排序
    - 分页处理
    
    返回：
        - ItemListResponse: 包含总记录数和分页后的数据
    """
    # 创建基础查询
    query = db.query(Item)
    
    # 应用筛选条件
    if category:
        query = query.filter(Item.category == category)
    if status:
        query = query.filter(Item.status == status)
    if tags:
        query = query.filter(Item.tags == tags)
    if rating:
        query = query.filter(Item.rating == rating)
    
    # 统计总数（分页前）
    total = query.count()
    
    # 应用排序
    if sort_by == "rating":
        order_column = Item.rating
    elif sort_by == "title":
        order_column = Item.title
    else:
        order_column = Item.create_time
    
    # 根据排序方向应用排序
    if order == "desc":
        query = query.order_by(order_column.desc())
    else:
        query = query.order_by(order_column.asc())
    
    # 应用分页
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    
    # 返回响应
    return ItemListResponse(
        code=200,
        message="查询成功",
        total=total,
        data=items
    )


# ==================== 获取统计数据 ====================
@app.get("/api/items/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    获取统计数据
    
    返回：
        - StatsResponse: 包含多种统计数据
            - total: 总记录数
            - category_counts: 分类统计（书籍/影视数量）
            - status_counts: 状态统计（想看/在看/已看完数量）
            - rating_distribution: 评分分布（各评分数量）
    """
    # 获取所有记录
    all_items = db.query(Item).all()
    total = len(all_items)
    
    # 统计分类数量
    book_count = len([item for item in all_items if item.category == "book"])
    movie_count = len([item for item in all_items if item.category == "movie"])
    
    # 统计状态数量
    want_count = len([item for item in all_items if item.status == "want"])
    watching_count = len([item for item in all_items if item.status == "watching"])
    finished_count = len([item for item in all_items if item.status == "finished"])
    
    # 统计评分分布
    rating_distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for item in all_items:
        if item.rating in rating_distribution:
            rating_distribution[item.rating] += 1
    
    # 构建统计数据
    stats_data = {
        "total": total,
        "category_counts": {
            "book": book_count,
            "movie": movie_count
        },
        "status_counts": {
            "want": want_count,
            "watching": watching_count,
            "finished": finished_count
        },
        "rating_distribution": rating_distribution
    }
    
    return StatsResponse(
        code=200,
        message="查询成功",
        data=stats_data
    )


# ==================== 获取单条记录 ====================
@app.get("/api/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    根据ID获取单条记录
    
    参数：
        - item_id: 记录ID
    
    返回：
        - ItemResponse: 记录详情
    
    异常：
        - 404: 记录不存在
    """
    # 查询数据库
    item = db.query(Item).filter(Item.id == item_id).first()
    
    # 如果不存在，抛出404异常
    if item is None:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    return item


# ==================== 更新记录 ====================
@app.put("/api/items/{item_id}", response_model=MessageResponse)
def update_item(
    item_id: int, 
    item_update: ItemUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    更新书单/影单记录
    
    参数：
        - item_id: 记录ID
        - item_update: ItemUpdate 模型，只更新提供的字段
    
    返回：
        - MessageResponse: 更新结果
    
    异常：
        - 404: 记录不存在
        - 400: 更新失败
    """
    # 查询现有记录
    db_item = db.query(Item).filter(Item.id == item_id).first()
    
    # 如果不存在，抛出404异常
    if db_item is None:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    # 获取更新数据（排除 None 值）
    update_data = item_update.model_dump(exclude_unset=True)
    
    # 遍历更新字段
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    # 提交更新
    db.commit()
    db.refresh(db_item)
    
    return MessageResponse(
        code=200,
        message="更新成功",
        data={"id": db_item.id}
    )


# ==================== 删除记录 ====================
@app.delete("/api/items/{item_id}", response_model=MessageResponse)
def delete_item(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    删除书单/影单记录
    
    参数：
        - item_id: 记录ID
    
    返回：
        - MessageResponse: 删除结果
    
    异常：
        - 404: 记录不存在
    """
    # 查询现有记录
    db_item = db.query(Item).filter(Item.id == item_id).first()
    
    # 如果不存在，抛出404异常
    if db_item is None:
        raise HTTPException(status_code=404, detail="记录不存在")
    
    # 删除记录
    db.delete(db_item)
    db.commit()
    
    return MessageResponse(
        code=200,
        message="删除成功",
        data={"id": item_id}
    )
