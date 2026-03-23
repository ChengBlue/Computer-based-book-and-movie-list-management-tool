# 书单/影单管理工具

一个简洁优雅的书籍和影视作品记录管理工具，支持电脑和手机端访问，帮助你追踪想看、在看、已看完的各类内容。

![Vue3](https://img.shields.io/badge/Vue3-3.4%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![Element Plus](https://img.shields.io/badge/Element%20Plus-2.5%2B-purple)

## 功能特性

### 🔐 登录认证

- **JWT 令牌认证** - 安全可靠的登录机制
- **密码加密存储** - 使用 bcrypt 加密保护用户密码
- **7天有效期** - 登录一次，一周内无需重复登录
- **默认账号** - 预置 admin/123456 账号

### 📚 基础功能

- **分类管理** - 支持书籍和影视两大分类
- **信息录入** - 记录标题、类型、作者/导演/演员、评分（1-5星）、状态、备注
- **三种状态** - 想看 / 在看 / 已看完
- **卡片展示** - 按状态分组显示，清晰直观

### 🎯 进阶功能

- **自定义标签** - 为每条记录添加多个标签，支持快速筛选
- **进度追踪** - 仅"在看"状态支持进度记录（书籍显示页数，影视显示集数）
- **排序功能** - 支持按添加时间、评分、标题三种方式排序
- **随机推荐** - 从"想看"列表中随机抽取推荐
- **数据统计** - 展示总记录数、分类统计、状态分布饼图、评分分布柱状图

### 📱 多端适配

- **响应式布局** - 完美适配桌面端和移动端
- **用户偏好保存** - 自动保存筛选、排序偏好，换设备也能继续使用
- **触屏优化** - 手机端按钮和输入框更大更适合触摸操作

### 🎨 交互设计

- **编辑回显** - 点击编辑按钮，数据自动回填到表单
- **删除确认** - 删除操作前有确认提示
- **Toast提示** - 操作成功后显示轻量级提示
- **XSS防护** - 用户输入内容经过转义处理，安全可靠

## 技术栈

### 前端

- **Vue 3.4+** - 渐进式 JavaScript 框架
- **Element Plus** - 基于 Vue 3 的组件库
- **Vite 5.x** - 下一代前端构建工具
- **Vue Router 4.x** - 官方路由管理器
- **Axios** - HTTP 客户端
- **ECharts 5.x** - 数据可视化图表

### 后端

- **Python 3.11+** - 后端语言
- **FastAPI** - 现代高性能 Web 框架
- **SQLAlchemy 2.x** - Python ORM 工具
- **SQLite** - 轻量级嵌入式数据库
- **Pydantic 2.x** - 数据验证
- **python-jose** - JWT 令牌处理
- **bcrypt** - 密码哈希

## 项目结构

```
book-movie-list/
├── 启动.bat                  # Windows 双击启动（后端+前端）
├── 启动.ps1                  # PowerShell 启动脚本
├── README.md                 # 项目文档
├── index.html                # 纯前端版（localStorage）
│
├── frontend/                 # Vue3 + Element Plus 前端
│   ├── package.json          # 前端依赖
│   ├── vite.config.js        # Vite 配置
│   ├── index.html            # HTML 入口
│   ├── src/
│   │   ├── main.js           # 入口文件
│   │   ├── App.vue           # 主组件（登录+主界面）
│   │   ├── api/
│   │   │   └── index.js      # API 接口封装
│   │   └── router/
│   │       └── index.js      # 路由配置
│   └── dist/                 # 打包后的静态文件
│
└── backend/                  # FastAPI 后端
    ├── requirements.txt      # Python 依赖
    ├── app/
    │   ├── __init__.py
    │   ├── main.py           # FastAPI 主程序
    │   ├── models.py         # SQLAlchemy 模型
    │   ├── schemas.py        # Pydantic 模型
    │   ├── database.py       # 数据库配置
    │   ├── auth.py           # JWT 认证工具
    │   └── user_model.py     # 用户模型
    └── items.db              # SQLite 数据库文件
```

## 快速启动

### Windows 双击启动（推荐）

项目根目录提供了启动脚本，双击即可运行：

| 脚本       | 说明                                       |
| ---------- | ------------------------------------------ |
| `启动.bat` | 同时启动后端（8000端口）和前端（3000端口） |

启动后：

- 🌐 前端地址：http://localhost:3000
- 🔧 后端 API：http://localhost:8000
- 📖 API 文档：http://localhost:8000/docs

### 手动启动

#### 后端

```bash
cd backend
pip install -r requirements.txt
python run.py
# 或使用 uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 前端

```bash
cd frontend
npm install
npm run dev
```

---

# 使用说明

## 登录

1. 打开 http://localhost:3000
2. 使用默认账号登录：
   - 用户名：`admin`
   - 密码：`123456`
3. 登录成功后即可使用全部功能

## 添加记录

1. 选择分类（书籍/影视）
2. 填写标题、选择类型
3. 设置评分（1-5星）
4. 选择状态（想看/在看/已看完）
5. 可选填写：作者/导演/演员、标签、备注
6. 点击"添加记录"按钮提交

## 编辑记录

1. 点击列表中任意记录的"编辑"按钮
2. 表单会自动填充现有数据
3. 修改后点击"更新记录"完成编辑

## 删除记录

1. 点击记录右下角的"删除"按钮
2. 确认后永久删除该记录

## 标签筛选

- 点击记录上的标签胶囊可快速筛选
- 顶部标签栏显示所有已使用的标签
- 再次点击同一标签可取消筛选

## 排序

- 使用筛选栏的下拉选择器切换排序方式
- 支持按添加时间（最新/最旧）、评分（高/低）、标题（A-Z）

## 随机推荐

- 点击页面顶部的"随机推荐"按钮
- 从"想看"状态的记录中随机抽取展示

## 数据统计

- 点击"数据统计"展开统计面板
- 查看书籍/影视总数、状态分布饼图、评分分布柱状图

---

# 后端 API 文档

## 接口列表

| 方法   | 路径                 | 说明                         | 认证 |
| ------ | -------------------- | ---------------------------- | ---- |
| POST   | /api/login           | 用户登录                     | 否   |
| POST   | /api/items           | 添加记录                     | ✅    |
| GET    | /api/items           | 查询记录列表（支持筛选排序） | ✅    |
| GET    | /api/items/{item_id} | 查询单条记录                 | ✅    |
| PUT    | /api/items/{item_id} | 更新记录                     | ✅    |
| DELETE | /api/items/{item_id} | 删除记录                     | ✅    |
| GET    | /api/items/stats     | 获取统计数据                 | ✅    |

## 1. 用户登录 (POST /api/login)

**请求体：**

```json
{
    "username": "admin",
    "password": "123456"
}
```

**响应示例：**

```json
{
    "code": 200,
    "message": "登录成功",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "username": "admin"
    }
}
```

**使用认证：**
登录后，后续请求需要在 Header 中携带 Token：

```
Authorization: Bearer <your_token>
```

## 2. 添加记录 (POST /api/items)

**请求头：**

```
Authorization: Bearer <your_token>
```

**请求体：**

```json
{
    "title": "书名/影片名",
    "category": "book",
    "type": "小说",
    "author": "作者名",
    "rating": 5,
    "status": "finished",
    "remark": "备注内容",
    "progress": "{\"type\":\"page\",\"current\":50,\"total\":200}",
    "tags": "标签1,标签2"
}
```

## 3. 查询记录列表 (GET /api/items)

**查询参数：**

| 参数      | 类型   | 说明                                 |
| --------- | ------ | ------------------------------------ |
| category  | string | 筛选分类：book, movie                |
| status    | string | 筛选状态：want, watching, finished   |
| tags      | string | 筛选标签                             |
| rating    | int    | 筛选评分：1-5                        |
| sort_by   | string | 排序字段：create_time, rating, title |
| order     | string | 排序方向：asc, desc                  |
| page      | int    | 页码，默认1                          |
| page_size | int    | 每页数量，默认20                     |

**响应示例：**

```json
{
    "code": 200,
    "message": "查询成功",
    "total": 10,
    "data": [
        {
            "id": 1,
            "title": "三体",
            "category": "book",
            "type": "科幻小说",
            "rating": 5,
            "status": "finished",
            "create_time": "2024-01-15T10:30:00"
        }
    ]
}
```

## 4. 获取统计数据 (GET /api/items/stats)

**响应示例：**

```json
{
    "code": 200,
    "message": "查询成功",
    "data": {
        "total": 20,
        "category_counts": {
            "book": 12,
            "movie": 8
        },
        "status_counts": {
            "want": 5,
            "watching": 3,
            "finished": 12
        },
        "rating_distribution": {
            "1": 0,
            "2": 2,
            "3": 5,
            "4": 8,
            "5": 5
        }
    }
}
```

## 数据库说明

### 自动初始化

应用启动时会自动：

1. 创建 SQLite 数据库文件 `items.db`
2. 创建 `items` 表（书单/影单记录）
3. 创建 `users` 表（用户）
4. 创建默认用户 admin（密码：123456）

### 数据库模型

**items 表：**

| 字段        | 类型         | 说明                         |
| ----------- | ------------ | ---------------------------- |
| id          | INTEGER      | 主键，自增                   |
| title       | VARCHAR(200) | 标题                         |
| category    | VARCHAR(20)  | 分类：book/movie             |
| type        | VARCHAR(50)  | 类型                         |
| author      | VARCHAR(100) | 作者（书籍用）               |
| director    | VARCHAR(100) | 导演（影视用）               |
| actor       | VARCHAR(200) | 演员（影视用）               |
| rating      | INTEGER      | 评分：1-5                    |
| status      | VARCHAR(20)  | 状态：want/watching/finished |
| remark      | VARCHAR(500) | 备注                         |
| progress    | VARCHAR(200) | 进度（JSON字符串）           |
| tags        | VARCHAR(200) | 标签（逗号分隔）             |
| create_time | DATETIME     | 创建时间                     |

**users 表：**

| 字段            | 类型         | 说明           |
| --------------- | ------------ | -------------- |
| id              | INTEGER      | 主键，自增     |
| username        | VARCHAR(50)  | 用户名（唯一） |
| hashed_password | VARCHAR(200) | 加密后的密码   |
| created_at      | DATETIME     | 创建时间       |

---

# 部署指南

## 方式一：前端 Vercel + 后端 Render

### 前端部署到 Vercel

1. 打包前端：`cd frontend && npm run build`
2. 访问 https://vercel.com 并登录
3. 点击 "New Project" 导入 GitHub 仓库
4. 配置：
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 点击 "Deploy"

### 后端部署到 Render

1. 访问 https://render.com 并登录
2. 点击 "New" -> "Web Service"
3. 连接 GitHub 仓库
4. 配置：
   - Name: book-movie-api
   - Region: Oregon
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. 点击 "Create Web Service"

### 更新前端 API 地址

部署后修改 `frontend/src/api/index.js`：

```javascript
const apiClient = axios.create({
  baseURL: 'https://your-backend.onrender.com/api',
  // ...
})
```

## 方式二：Render 完整部署

创建 `render.yaml`：

```yaml
services:
  - type: web
    name: book-movie-backend
    env: python
    region: oregon
    buildCommand: pip install -r backend/requirements.txt
    startCommand: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: "3.11"
```

---

## 默认账号

部署后默认登录账号：

- 用户名：`admin`
- 密码：`123456`

---

## 常见问题

### 1. 登录失败 (500 错误)

- 确保后端已正确安装依赖：python-jose, bcrypt
- 重启后端服务

### 2. Vercel 部署后 API 请求失败

- 检查前端 api/index.js 中的 baseURL 配置
- 确保后端 Render 服务已启动

### 3. 数据库持久化

- Render 免费版会在一段时间后休眠
- 重新激活可能需要等待几秒

### 4. Token 失效

- 检查后端 SECRET_KEY 是否一致
- 确保前后端时间同步

---

## 许可证

MIT License - 随意使用和修改
