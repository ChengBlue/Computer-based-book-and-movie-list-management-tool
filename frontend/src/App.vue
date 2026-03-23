<template>
  <div v-if="!isLoggedIn" class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>📚 书单 / 🎬 影单管理工具</h2>
          <p class="subtitle">请先登录</p>
        </div>
      </template>
      
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="50px" class="login-form">
        <el-form-item label="用户名" prop="username" class="login-item">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" @keyup.enter="handleLogin" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password" class="login-item">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" show-password />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loginLoading" @click="handleLogin" style="width: 100%">登录</el-button>
        </el-form-item>
      </el-form>
      
      <div class="tips">默认账号：admin<br>默认密码：123456</div>
    </el-card>
  </div>

  <div v-else class="app-container">
    <div class="header">
      <h1>📚 书单 / 🎬 影单管理工具</h1>
      <div class="header-actions">
        <el-button type="primary" @click="randomRecommend">随机推荐</el-button>
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <div class="main-content">
      <div class="left-panel">
        <el-card class="form-card">
          <template #header>
            <div class="card-header">
              <span>{{ isEditing ? '✏️ 编辑记录' : '➕ 添加记录' }}</span>
            </div>
          </template>

          <el-alert v-if="isEditing" title="正在编辑记录，提交后自动更新" type="info" :closable="false" show-icon class="edit-hint" />

          <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="entry-form">
            <el-form-item label="分类" prop="category">
              <el-radio-group v-model="form.category">
                <el-radio value="book">📚 书籍</el-radio>
                <el-radio value="movie">🎬 影视</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题" />
            </el-form-item>

            <el-form-item label="类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                <el-option v-for="item in typeOptions[form.category]" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>

            <el-form-item label="评分" prop="rating">
              <el-rate v-model="form.rating" :max="5" />
            </el-form-item>

            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio value="want">想看</el-radio>
                <el-radio value="watching">在看</el-radio>
                <el-radio value="finished">已看完</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="form.category === 'book'" label="作者">
              <el-input v-model="form.author" placeholder="请输入作者" />
            </el-form-item>

            <el-form-item v-if="form.category === 'movie'" label="导演">
              <el-input v-model="form.director" placeholder="请输入导演" />
            </el-form-item>

            <el-form-item v-if="form.category === 'movie'" label="演员">
              <el-input v-model="form.actor" placeholder="请输入主要演员，多人用逗号分隔" />
            </el-form-item>

            <el-form-item v-if="form.status === 'watching'" label="进度">
              <div class="progress-inputs">
                <el-input-number v-model="progressCurrent" :min="0" placeholder="当前" controls-position="right" />
                <span>/</span>
                <el-input-number v-model="progressTotal" :min="1" placeholder="总数" controls-position="right" />
                <span>{{ progressUnit }}</span>
              </div>
            </el-form-item>

            <el-form-item label="标签">
              <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
            </el-form-item>

            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="submitForm" :loading="submitLoading">{{ isEditing ? '更新记录' : '添加记录' }}</el-button>
              <el-button @click="resetForm" v-if="isEditing">取消编辑</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>

      <div class="right-panel">
        <el-card class="stats-card" v-if="statsShow">
          <template #header>
            <div class="card-header">
              <span>📊 数据统计</span>
              <el-button text @click="statsShow = false"><el-icon><Close /></el-icon></el-button>
            </div>
          </template>
          <div class="stats-content">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">总记录</div>
                  <div class="stat-value">{{ statsData.total }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">书籍</div>
                  <div class="stat-value text-blue">{{ statsData.category_counts?.book || 0 }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-label">影视</div>
                  <div class="stat-value text-pink">{{ statsData.category_counts?.movie || 0 }}</div>
                </div>
              </el-col>
            </el-row>
            <el-row :gutter="20" class="chart-row">
              <el-col :span="12">
                <div class="chart-title">状态分布</div>
                <div ref="statusChartRef" class="chart-container"></div>
              </el-col>
              <el-col :span="12">
                <div class="chart-title">评分分布</div>
                <div ref="ratingChartRef" class="chart-container"></div>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <el-card>
          <template #header>
            <div class="card-header">
              <el-button text @click="statsShow = !statsShow">
                <el-icon><DataAnalysis /></el-icon> 数据统计
              </el-button>
              <el-button text @click="loadData">
                <el-icon><Refresh /></el-icon> 刷新
              </el-button>
            </div>
          </template>

          <div class="filter-bar">
            <el-select v-model="filterParams.category" placeholder="分类" clearable @change="loadData">
              <el-option label="全部" value="" />
              <el-option label="书籍" value="book" />
              <el-option label="影视" value="movie" />
            </el-select>
            <el-select v-model="filterParams.status" placeholder="状态" clearable @change="loadData">
              <el-option label="全部" value="" />
              <el-option label="想看" value="want" />
              <el-option label="在看" value="watching" />
              <el-option label="已看完" value="finished" />
            </el-select>
            <el-select v-model="filterParams.tags" placeholder="标签" clearable @change="loadData">
              <el-option label="全部" value="" />
              <el-option v-for="tag in allTags" :key="tag" :label="tag" :value="tag" />
            </el-select>
            <el-select v-model="filterParams.sort_by" placeholder="排序" @change="loadData">
              <el-option label="按时间(最新)" value="create_time" />
              <el-option label="按时间(最旧)" value="create_time" />
              <el-option label="按评分(高)" value="rating" />
              <el-option label="按评分(低)" value="rating" />
              <el-option label="按标题(A-Z)" value="title" />
            </el-select>
            <el-select v-model="filterParams.order" placeholder="方向" @change="loadData">
              <el-option label="降序" value="desc" />
              <el-option label="升序" value="asc" />
            </el-select>
          </div>

          <div class="tag-cloud" v-if="allTags.length > 0">
            <el-tag v-for="tag in allTags" :key="tag" :type="filterParams.tags === tag ? 'primary' : 'info'" 
              @click="filterParams.tags = tag; loadData()" style="cursor: pointer; margin: 2px;">{{ tag }}</el-tag>
          </div>

          <div class="item-grid">
            <div v-for="item in itemList" :key="item.id" class="item-card">
              <div class="item-header">
                <div>
                  <el-tag size="small" :type="item.category === 'book' ? 'success' : 'warning'">
                    {{ item.category === 'book' ? '📚' : '🎬' }}
                  </el-tag>
                  <strong>{{ item.title }}</strong>
                  <span style="color: #909399; margin-left: 8px;">{{ item.type }}</span>
                </div>
                <div class="item-actions">
                  <el-button size="small" type="primary" text @click="editItem(item)">编辑</el-button>
                  <el-button size="small" type="danger" text @click="deleteItem(item.id)">删除</el-button>
                </div>
              </div>
              <div style="margin: 8px 0;">
                <el-rate v-model="item.rating" disabled size="small" />
              </div>
              <div>
                <el-tag size="small" :type="statusType[item.status]">{{ statusLabel[item.status] }}</el-tag>
                <span v-if="item.tags" style="margin-left: 8px;">
                  <el-tag v-for="tag in item.tags.split(',')" :key="tag" size="small" type="info" style="margin: 0 2px;">{{ tag }}</el-tag>
                </span>
              </div>
              <div v-if="item.remark" style="margin-top: 8px; color: #606266; font-size: 13px;">{{ item.remark }}</div>
            </div>
          </div>

          <el-pagination v-if="total > 0" style="margin-top: 20px; justify-content: center; display: flex;"
            v-model:current-page="filterParams.page"
            v-model:page-size="filterParams.page_size"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadData"
            @current-change="loadData"
          />
        </el-card>
      </div>
    </div>

    <el-dialog v-model="recommendVisible" title="随机推荐" width="400px" class="recommend-dialog">
      <div v-if="recommendItem" style="text-align: center; padding: 20px;">
        <el-tag size="large" :type="recommendItem.category === 'book' ? 'success' : 'warning'" style="margin-bottom: 15px;">
          {{ recommendItem.category === 'book' ? '📚 书籍' : '🎬 影视' }}
        </el-tag>
        <h2 style="margin: 10px 0;">{{ recommendItem.title }}</h2>
        <p style="color: #909399;">{{ recommendItem.type }}</p>
        <el-rate v-model="recommendItem.rating" disabled style="margin: 15px 0;" />
        <el-tag :type="statusType[recommendItem.status]">{{ statusLabel[recommendItem.status] }}</el-tag>
        <p v-if="recommendItem.remark" style="margin-top: 15px; color: #606266;">{{ recommendItem.remark }}</p>
      </div>
      <template #footer>
        <el-button @click="recommendVisible = false">关闭</el-button>
        <el-button type="primary" @click="randomRecommend">再换一批</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Close, DataAnalysis, Refresh, Plus, Search, Edit, Delete, Clock } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import api, { getToken, setToken, removeToken } from './api'

const typeOptions = {
  book: [
    { value: '小说', label: '小说' },
    { value: '社科', label: '社科' },
    { value: '工具', label: '工具' },
    { value: '其他', label: '其他' }
  ],
  movie: [
    { value: '电影', label: '电影' },
    { value: '剧集', label: '剧集' },
    { value: '纪录片', label: '纪录片' },
    { value: '其他', label: '其他' }
  ]
}

const statusType = { want: 'info', watching: 'primary', finished: 'success' }
const statusLabel = { want: '想看', watching: '在看', finished: '已看完' }

const formRef = ref(null)
const submitLoading = ref(false)

const form = reactive({
  title: '',
  category: 'book',
  type: '',
  author: '',
  director: '',
  actor: '',
  rating: 3,
  status: 'want',
  remark: '',
  progress: '',
  tags: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const progressCurrent = ref(0)
const progressTotal = ref(100)

const filterParams = reactive({
  category: '',
  status: '',
  tags: '',
  sort_by: 'create_time',
  order: 'desc',
  page: 1,
  page_size: 20
})

const PREF_KEY = 'userPreferences'

function loadPreferences() {
  try {
    const saved = localStorage.getItem(PREF_KEY)
    if (saved) {
      const prefs = JSON.parse(saved)
      filterParams.category = prefs.category || ''
      filterParams.status = prefs.status || ''
      filterParams.tags = prefs.tags || ''
      filterParams.sort_by = prefs.sort_by || 'create_time'
      filterParams.order = prefs.order || 'desc'
      filterParams.page_size = prefs.page_size || 20
    }
  } catch (e) {
    console.error('加载偏好设置失败:', e)
  }
}

function savePreferences() {
  try {
    const prefs = {
      category: filterParams.category,
      status: filterParams.status,
      tags: filterParams.tags,
      sort_by: filterParams.sort_by,
      order: filterParams.order,
      page_size: filterParams.page_size
    }
    localStorage.setItem(PREF_KEY, JSON.stringify(prefs))
  } catch (e) {
    console.error('保存偏好设置失败:', e)
  }
}

const itemList = ref([])
const total = ref(0)
const allTags = ref([])

const isEditing = ref(false)
const editingId = ref(null)

const statsShow = ref(false)
const statsData = ref({
  total: 0,
  category_counts: { book: 0, movie: 0 },
  status_counts: { want: 0, watching: 0, finished: 0 },
  rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
})

const statusChartRef = ref(null)
const ratingChartRef = ref(null)
let statusChart = null
let ratingChart = null

const recommendVisible = ref(false)
const recommendItem = ref(null)

const progressUnit = computed(() => form.category === 'book' ? '页' : '集')

const isLoggedIn = ref(false)
const loginFormRef = ref(null)
const loginLoading = ref(false)
const loginForm = reactive({
  username: 'admin',
  password: '123456'
})
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loginLoading.value = true
    try {
      const res = await api.login(loginForm.username, loginForm.password)
      if (res.code === 200) {
        setToken(res.data.token)
        isLoggedIn.value = true
        ElMessage.success('登录成功')
        loadData()
        loadStats()
      }
    } catch (error) {
    } finally {
      loginLoading.value = false
    }
  })
}

const handleLogout = () => {
  removeToken()
  isLoggedIn.value = false
  loginForm.password = ''
}

const loadData = async () => {
  try {
    const params = { ...filterParams }
    if (params.sort_by === 'create_time' && filterParams.order === 'asc') {
      params.sort_by = 'create_time'
    }
    const res = await api.getItems(params)
    itemList.value = res.data || []
    total.value = res.total || 0
    
    const tags = new Set()
    ;(res.data || []).forEach(item => {
      if (item.tags) {
        item.tags.split(',').forEach(t => t && tags.add(t.trim()))
      }
    })
    allTags.value = Array.from(tags)
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

const loadStats = async () => {
  try {
    const res = await api.getStats()
    if (res.data) {
      statsData.value = res.data
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const progressData = {}
      if (form.status === 'watching') {
        progressData.progress = JSON.stringify({
          type: form.category === 'book' ? 'page' : 'episode',
          current: progressCurrent.value,
          total: progressTotal.value
        })
      }
      
      const data = { ...form, ...progressData }
      
      if (isEditing.value) {
        await api.updateItem(editingId.value, data)
        ElMessage.success('更新成功')
      } else {
        await api.createItem(data)
        ElMessage.success('添加成功')
      }
      
      resetForm()
      await loadData()
      await loadStats()
    } catch (error) {
    } finally {
      submitLoading.value = false
    }
  })
}

const resetForm = () => {
  form.title = ''
  form.category = 'book'
  form.type = ''
  form.author = ''
  form.director = ''
  form.actor = ''
  form.rating = 3
  form.status = 'want'
  form.remark = ''
  form.progress = ''
  form.tags = ''
  progressCurrent.value = 0
  progressTotal.value = 100
  isEditing.value = false
  editingId.value = null
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const editItem = (item) => {
  form.title = item.title
  form.category = item.category
  form.type = item.type
  form.author = item.author || ''
  form.director = item.director || ''
  form.actor = item.actor || ''
  form.rating = item.rating
  form.status = item.status
  form.remark = item.remark || ''
  form.tags = item.tags || ''
  
  if (item.progress) {
    try {
      const p = JSON.parse(item.progress)
      progressCurrent.value = p.current || 0
      progressTotal.value = p.total || 100
    } catch (e) {
      progressCurrent.value = 0
      progressTotal.value = 100
    }
  } else {
    progressCurrent.value = 0
    progressTotal.value = 100
  }
  
  isEditing.value = true
  editingId.value = item.id
}

const deleteItem = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', { type: 'warning' })
    await api.deleteItem(id)
    ElMessage.success('删除成功')
    await loadData()
    await loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const updateCharts = () => {
  nextTick(() => {
    if (statusChartRef.value) {
      if (!statusChart) {
        statusChart = echarts.init(statusChartRef.value)
      }
      statusChart.setOption({
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: [
            { value: statsData.value.status_counts?.want || 0, name: '想看' },
            { value: statsData.value.status_counts?.watching || 0, name: '在看' },
            { value: statsData.value.status_counts?.finished || 0, name: '已看完' }
          ]
        }]
      })
    }
    
    if (ratingChartRef.value) {
      if (!ratingChart) {
        ratingChart = echarts.init(ratingChartRef.value)
      }
      const dist = statsData.value.rating_distribution || {}
      ratingChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: ['1星', '2星', '3星', '4星', '5星'] },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: [dist[1] || 0, dist[2] || 0, dist[3] || 0, dist[4] || 0, dist[5] || 0],
          itemStyle: { color: '#409eff' }
        }]
      })
    }
  })
}

const randomRecommend = async () => {
  try {
    const res = await api.getItems({ status: 'want', page_size: 100 })
    const items = res.data || []
    if (items.length === 0) {
      ElMessage.warning('没有"想看"状态的记录')
      return
    }
    const randomIndex = Math.floor(Math.random() * items.length)
    recommendItem.value = items[randomIndex]
    recommendVisible.value = true
  } catch (error) {
    console.error('获取推荐失败:', error)
  }
}

onMounted(() => {
  const token = getToken()
  if (token) {
    isLoggedIn.value = true
    loadPreferences()
    loadData()
    loadStats()
  }
})

watch(() => filterParams, () => {
  savePreferences()
}, { deep: true })

watch(() => statsShow.value, (newVal) => {
  if (newVal) {
    nextTick(() => {
      updateCharts()
    })
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.subtitle {
  margin: 5px 0 0;
  color: #999;
  font-size: 14px;
}

.tips {
  text-align: center;
  color: #999;
  font-size: 12px;
  line-height: 1.8;
}

.login-form :deep(.el-form-item__label) {
  white-space: nowrap;
}

.login-form :deep(.el-input) {
  width: 100%;
}

:deep(.el-card) {
  border-radius: 12px;
}

.app-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  color: #303133;
}

.main-content {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
}

.left-panel .form-card {
  position: sticky;
  top: 20px;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.edit-hint {
  margin-bottom: 15px;
}

.entry-form {
  padding-right: 10px;
}

.progress-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-inputs .el-input-number {
  width: 100px;
}

.stats-card .stats-content {
  padding: 10px 0;
}

.stat-item {
  text-align: center;
  padding: 15px 0;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.stat-value.text-blue {
  color: #409eff;
}

.stat-value.text-pink {
  color: #f56c6c;
}

.chart-row {
  margin-top: 20px;
}

.chart-title {
  text-align: center;
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.chart-container {
  height: 180px;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.item-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 15px;
  transition: box-shadow 0.3s;
}

.item-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.item-actions {
  display: flex;
  gap: 5px;
}

.tag-cloud {
  margin-bottom: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }

  .header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .header h1 {
    font-size: 18px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .el-button {
    flex: 1;
  }

  .main-content {
    grid-template-columns: 1fr;
  }

  .left-panel .form-card {
    position: static;
  }

  .entry-form :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
  }

  .entry-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }

  .progress-inputs {
    flex-wrap: wrap;
  }

  .progress-inputs .el-input-number {
    width: 80px;
  }

  .filter-bar {
    flex-direction: column;
  }

  .filter-bar .el-select,
  .filter-bar .el-input {
    width: 100% !important;
  }

  .stats-card :deep(.el-row) {
    flex-direction: column;
  }

  .stats-card :deep(.el-col) {
    max-width: 100%;
    flex: 0 0 100%;
  }

  .stat-item {
    margin-bottom: 10px;
  }

  .chart-container {
    height: 150px;
  }

  .item-header {
    flex-direction: column;
    gap: 8px;
  }

  .item-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    gap: 5px;
  }

  .item-actions .el-button {
    padding: 4px 8px;
    font-size: 12px;
  }

  .recommend-dialog :deep(.el-dialog) {
    width: 90% !important;
  }

  :deep(.el-dialog) {
    width: 90% !important;
    max-width: 400px;
  }
}
</style>