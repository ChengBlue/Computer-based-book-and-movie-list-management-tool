# -*- coding: utf-8 -*-
"""
数据库模型定义
使用 SQLAlchemy ORM 定义 item 表结构
"""

# 导入 SQLAlchemy 的列类型和约束
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

# 导入数据库基类
from .database import Base


class Item(Base):
    """
    书单/影单记录模型
    
    对应数据库中的 item 表
    """
    # 表名
    __tablename__ = "items"
    
    # 主键自增ID
    id = Column(Integer, primary_key=True, index=True)
    
    # 标题（必填）
    title = Column(String(200), nullable=False, index=True)
    
    # 分类：book（书籍）或 movie（影视）
    category = Column(String(20), nullable=False, default="book")
    
    # 类型：小说、电影、剧集、纪录片等
    type = Column(String(50), nullable=False)
    
    # 作者（书籍用，可选）
    author = Column(String(100), nullable=True)
    
    # 导演（影视用，可选）
    director = Column(String(100), nullable=True)
    
    # 演员（影视用，可选）
    actor = Column(String(200), nullable=True)
    
    # 评分：1-5 的整数
    rating = Column(Integer, nullable=False)
    
    # 状态：want（想看）、watching（在看）、finished（已看完）
    status = Column(String(20), nullable=False, default="want")
    
    # 备注/简介（可选）
    remark = Column(String(500), nullable=True)
    
    # 进度（JSON格式字符串，可选）
    # 格式：{"type": "page|episode|time", "current": 50, "total": 200}
    progress = Column(String(200), nullable=True)
    
    # 标签（用逗号分隔的字符串存储，可选）
    # 例如："科幻,经典,必看"
    tags = Column(String(200), nullable=True)
    
    # 创建时间
    create_time = Column(DateTime, default=datetime.now)
    
    def __repr__(self):
        """返回对象的字符串表示"""
        return f"<Item(id={self.id}, title='{self.title}', category='{self.category}')>"
