# -*- coding: utf-8 -*-
"""
Pydantic 模型定义
用于 API 请求参数验证和响应数据格式化
"""

# 导入 Pydantic 基础类型
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ItemCreate(BaseModel):
    """
    创建记录时的请求体模型
    定义了添加新记录时需要的字段和验证规则
    """
    # 标题：必填，最大200字符
    title: str = Field(..., max_length=200, description="标题")
    
    # 分类：必填，只能是 book 或 movie
    category: str = Field(..., pattern="^(book|movie)$", description="分类：book-书籍, movie-影视")
    
    # 类型：必填，最大50字符（如：小说、电影、剧集）
    type: str = Field(..., max_length=50, description="类型")
    
    # 作者（书籍用，可选）
    author: Optional[str] = Field(None, max_length=100, description="作者")
    
    # 导演（影视用，可选）
    director: Optional[str] = Field(None, max_length=100, description="导演")
    
    # 演员（影视用，可选）
    actor: Optional[str] = Field(None, max_length=200, description="演员")
    
    # 评分：必填，1-5的整数
    rating: int = Field(..., ge=1, le=5, description="评分：1-5")
    
    # 状态：必填，只能是 want、watching 或 finished
    status: str = Field(..., pattern="^(want|watching|finished)$", description="状态：want-想看, watching-在看, finished-已看完")
    
    # 备注：可选，最大500字符
    remark: Optional[str] = Field(None, max_length=500, description="备注")
    
    # 进度：可选，JSON格式字符串
    progress: Optional[str] = Field(None, description="进度 JSON 字符串")
    
    # 标签：可选，用逗号分隔的字符串
    tags: Optional[str] = Field(None, description="标签，逗号分隔")


class ItemUpdate(BaseModel):
    """
    更新记录时的请求体模型
    所有字段都是可选的，只更新提供的字段
    """
    # 标题：可选，最大200字符
    title: Optional[str] = Field(None, max_length=200)
    
    # 分类：可选
    category: Optional[str] = Field(None, pattern="^(book|movie)$")
    
    # 类型：可选
    type: Optional[str] = Field(None, max_length=50)
    
    # 作者：可选
    author: Optional[str] = Field(None, max_length=100)
    
    # 导演：可选
    director: Optional[str] = Field(None, max_length=100)
    
    # 演员：可选
    actor: Optional[str] = Field(None, max_length=200)
    
    # 评分：可选，1-5
    rating: Optional[int] = Field(None, ge=1, le=5)
    
    # 状态：可选
    status: Optional[str] = Field(None, pattern="^(want|watching|finished)$")
    
    # 备注：可选
    remark: Optional[str] = Field(None, max_length=500)
    
    # 进度：可选
    progress: Optional[str] = None
    
    # 标签：可选
    tags: Optional[str] = None


class ItemResponse(BaseModel):
    """
    记录响应模型
    返回单条记录时的数据格式
    """
    id: int
    title: str
    category: str
    type: str
    author: Optional[str]
    director: Optional[str]
    actor: Optional[str]
    rating: int
    status: str
    remark: Optional[str]
    progress: Optional[str]
    tags: Optional[str]
    create_time: datetime
    
    # 配置 ORM 模式，允许从 ORM 对象创建
    class Config:
        from_attributes = True


class ItemListResponse(BaseModel):
    """
    记录列表响应模型
    返回多条记录时的数据格式
    """
    code: int = Field(default=200, description="状态码")
    message: str = Field(default="success", description="提示信息")
    total: int = Field(description="总记录数")
    data: List[ItemResponse] = Field(description="记录列表")


class StatsResponse(BaseModel):
    """
    统计数据响应模型
    """
    code: int = Field(default=200, description="状态码")
    message: str = Field(default="success", description="提示信息")
    data: dict = Field(description="统计数据")


class MessageResponse(BaseModel):
    """
    通用消息响应模型
    用于返回操作结果（如删除成功、添加成功等）
    """
    code: int = Field(description="状态码")
    message: str = Field(description="提示信息")
    data: Optional[dict] = Field(None, description="可选的返回数据")


class LoginRequest(BaseModel):
    """登录请求模型"""
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class LoginResponse(BaseModel):
    """登录响应模型"""
    code: int = Field(default=200, description="状态码")
    message: str = Field(default="success", description="提示信息")
    data: dict = Field(description="登录结果，包含 token")


class TokenData(BaseModel):
    """Token 数据模型"""
    username: Optional[str] = None
