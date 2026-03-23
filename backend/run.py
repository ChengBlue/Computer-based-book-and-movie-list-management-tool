# -*- coding: utf-8 -*-
"""
应用启动入口
直接运行此文件即可启动服务器
"""

# 导入 uvicorn（ASGI 服务器）
import uvicorn

if __name__ == "__main__":
    """
    启动 FastAPI 应用
    
    配置说明：
        - app: 主应用模块（app.main:app）
        - host: 监听地址，0.0.0.0 表示监听所有网络接口
        - port: 监听端口，8000 是默认端口
        - reload: True 表示开启热重载（开发时使用）
        - log-level: 日志级别
    """
    uvicorn.run(
        "app.main:app",      # 应用模块路径
        host="0.0.0.0",      # 监听所有地址
        port=8000,           # 端口号
        reload=True,         # 开发模式：代码修改后自动重启
        log_level="info"     # 日志级别
    )
