# -*- coding: utf-8 -*-
"""
用户认证模型
定义用户表结构，用于存储用户信息
"""

from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .database import Base


class User(Base):
    """
    用户模型
    
    对应数据库中的 user 表
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}')>"