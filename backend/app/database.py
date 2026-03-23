# -*- coding: utf-8 -*-
"""
数据库配置文件
使用 SQLAlchemy 创建 SQLite 数据库连接
"""

# 导入 SQLAlchemy 的核心组件
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 数据库文件路径（相对于当前文件）
DATABASE_URL = "sqlite:///./items.db"

# 创建数据库引擎
# connect_args={"check_same_thread": False} 是 SQLite 特有的配置
# 允许在多线程环境下访问同一个数据库连接
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# 创建会话工厂
# 每个数据库操作都需要一个会话（Session）
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
# 所有的数据库模型都需要继承这个基类
Base = declarative_base()


def get_db():
    """
    获取数据库会话的依赖函数
    
    FastAPI 会自动调用这个函数来获取数据库会话
    使用 yield 将会话传递给路由函数
    会话使用完毕后会自动关闭
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    初始化数据库
    创建所有表（如果不存在的话）
    """
    # 导入所有模型，确保它们被注册
    from app.models import Item
    Base.metadata.create_all(bind=engine)
