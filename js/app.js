/**
 * 书单/影单管理工具 - JavaScript逻辑
 */

// ==================== 初始化 ====================
// 存储键名
const STORAGE_KEY = 'bookMovieList_data';
const SORT_KEY = 'bookMovieList_sort';

// 当前排序方式
let currentSort = 'time-desc';

// 当前筛选的标签
let currentTagFilter = null;

// 类型选项配置
const TYPE_OPTIONS = {
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
};

// 分类图标
const CATEGORY_ICONS = {
    book: '📚',
    movie: '🎬'
};

// 状态配置
const STATUS_CONFIG = {
    want: { label: '想看', color: 'purple' },
    watching: { label: '在看', color: 'blue' },
    finished: { label: '已看完', color: 'green' }
};

// 当前编辑的ID
let editingId = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initStarRating();
    initTypeSelect();
    loadSortSetting();
    renderTagFilters();
    loadData();
    updateStats();
    bindEvents();
});

// ==================== 事件绑定 ====================
function bindEvents() {
    // 表单提交
    document.getElementById('entryForm').addEventListener('submit', handleSubmit);
    
    // 分类切换时更新类型选项
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', updateTypeOptions);
    });
    
    // 状态切换时更新进度区域显示
    document.querySelectorAll('input[name="status"]').forEach(radio => {
        radio.addEventListener('change', updateProgressSection);
    });
}

// ==================== 初始化星星评分 ====================
function initStarRating() {
    const stars = document.querySelectorAll('.star-rating .star');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = parseInt(this.dataset.value);
            setRating(value);
        });
    });
}

// 设置评分
function setRating(value) {
    document.getElementById('rating').value = value;
    const stars = document.querySelectorAll('.star-rating .star');
    stars.forEach((star, index) => {
        if (index < value) {
            star.classList.add('active');
            star.classList.remove('text-slate-300');
        } else {
            star.classList.remove('active');
            star.classList.add('text-slate-300');
        }
    });
}

// ==================== 初始化类型选择 ====================
function initTypeSelect() {
    updateTypeOptions();
}

// 更新类型下拉选项
function updateTypeOptions() {
    const category = document.querySelector('input[name="category"]:checked').value;
    const typeSelect = document.getElementById('type');
    const currentValue = typeSelect.value;
    
    // 清空现有选项
    typeSelect.innerHTML = '<option value="">请选择类型</option>';
    
    // 添加对应分类的类型选项
    TYPE_OPTIONS[category].forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        typeSelect.appendChild(option);
    });

    // 尝试恢复之前选中的值（如果新分类中有这个选项）
    const hasOption = TYPE_OPTIONS[category].some(opt => opt.value === currentValue);
    if (hasOption) {
        typeSelect.value = currentValue;
    }
    
    // 更新进度区域的分类显示
    updateProgressSection();
}

// 更新进度区域显示
function updateProgressSection() {
    const status = document.querySelector('input[name="status"]:checked').value;
    const category = document.querySelector('input[name="category"]:checked')?.value || 'book';
    const progressSection = document.getElementById('progressSection');
    const bookProgress = document.getElementById('bookProgress');
    const movieProgress = document.getElementById('movieProgress');
    const progressUnit = document.getElementById('progressUnit');
    
    // 只有在看状态时才显示进度输入
    if (status === 'watching') {
        progressSection.classList.remove('hidden');
        
        if (category === 'book') {
            bookProgress.classList.remove('hidden');
            movieProgress.classList.add('hidden');
        } else {
            bookProgress.classList.add('hidden');
            movieProgress.classList.remove('hidden');
            // 电影显示时长单位
            const typeSelect = document.getElementById('type');
            const typeValue = typeSelect?.value;
            if (typeValue === '电影') {
                progressUnit.textContent = '集（时长）';
            } else {
                progressUnit.textContent = '集';
            }
        }
    } else {
        progressSection.classList.add('hidden');
    }
}

// ==================== 表单提交处理 ====================
function handleSubmit(e) {
    e.preventDefault();

    // 获取表单数据
    const title = document.getElementById('title').value.trim();
    const type = document.getElementById('type').value;
    const rating = parseInt(document.getElementById('rating').value);
    const status = document.querySelector('input[name="status"]:checked').value;
    const note = document.getElementById('note').value.trim();
    const category = document.querySelector('input[name="category"]:checked').value;
    
    // 获取标签，处理逗号分隔
    const tagsInput = document.getElementById('tags').value.trim();
    const tags = tagsInput ? tagsInput.split(/[,，]/).map(t => t.trim()).filter(t => t) : [];
    
    // 获取进度数据
    let progress = null;
    if (status === 'watching') {
        if (category === 'book') {
            const current = document.getElementById('progressCurrent').value.trim();
            const total = document.getElementById('progressTotal').value.trim();
            if (current && total) {
                progress = { type: 'page', current: parseInt(current), total: parseInt(total) };
            }
        } else {
            const current = document.getElementById('progressCurrentEp').value.trim();
            const total = document.getElementById('progressTotalEp').value.trim();
            if (current && total) {
                progress = { type: type === '电影' ? 'time' : 'episode', current, total };
            }
        }
    }

    // 验证标题
    if (!title) {
        showToast('请输入标题', 'error');
        return;
    }

    // 验证类型
    if (!type) {
        showToast('请选择类型', 'error');
        return;
    }

    // 验证评分
    if (rating === 0) {
        showToast('请选择评分', 'error');
        return;
    }

    // 创建记录对象
    const record = {
        id: editingId || Date.now().toString(),
        category,
        title,
        type,
        rating,
        status,
        note,
        tags,
        progress,
        createTime: editingId ? getRecordById(editingId)?.createTime : new Date().toISOString(),
        updateTime: new Date().toISOString()
    };

    // 保存数据
    if (editingId) {
        updateRecord(record);
        showToast('更新成功');
    } else {
        addRecord(record);
        showToast('添加成功');
    }

    // 重置表单
    resetForm();
}

// ==================== 数据操作 ====================
// 获取所有数据
function getAllData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// 保存所有数据
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 添加记录
function addRecord(record) {
    const data = getAllData();
    data.push(record);
    saveData(data);
    renderList();
    renderTagFilters();
    updateStats();
}

// 更新记录
function updateRecord(record) {
    const data = getAllData();
    const index = data.findIndex(item => item.id === record.id);
    if (index !== -1) {
        data[index] = record;
        saveData(data);
    }
    renderList();
    renderTagFilters();
    updateStats();
}

// 删除记录
function deleteRecord(id) {
    const data = getAllData();
    const newData = data.filter(item => item.id !== id);
    saveData(newData);
    renderList();
    renderTagFilters();
    updateStats();
    showToast('删除成功');
}

// 根据ID获取记录
function getRecordById(id) {
    const data = getAllData();
    return data.find(item => item.id === id);
}

// 清空某状态的所有记录
function clearStatus(status) {
    const statusLabel = STATUS_CONFIG[status].label;
    showConfirm(`确定要清空所有"${statusLabel}"记录吗？此操作不可撤销！`, () => {
        const data = getAllData();
        const newData = data.filter(item => item.status !== status);
        saveData(newData);
        renderList();
        renderTagFilters();
        updateStats();
        showToast('清空成功');
    });
}

// ==================== 渲染列表 ====================
function loadData() {
    renderList();
}

// 渲染列表
function renderList() {
    let data = getAllData();
    
    // 按标签筛选
    if (currentTagFilter) {
        data = data.filter(item => item.tags && item.tags.includes(currentTagFilter));
    }
    
    // 对数据排序
    const sortedData = sortData(data);
    
    // 按状态分组
    const grouped = {
        want: sortedData.filter(item => item.status === 'want'),
        watching: sortedData.filter(item => item.status === 'watching'),
        finished: sortedData.filter(item => item.status === 'finished')
    };

    // 更新计数
    document.getElementById('wantCount').textContent = `(${grouped.want.length})`;
    document.getElementById('watchingCount').textContent = `(${grouped.watching.length})`;
    document.getElementById('finishedCount').textContent = `(${grouped.finished.length})`;

    // 渲染各分组
    renderGroup('wantList', grouped.want);
    renderGroup('watchingList', grouped.watching);
    renderGroup('finishedList', grouped.finished);

    // 显示/隐藏空状态（基于筛选后的数据）
    const hasFilteredData = data.length > 0;
    document.getElementById('emptyState').classList.toggle('hidden', hasFilteredData);
    document.getElementById('listContainer').classList.toggle('hidden', !hasFilteredData);
}

// 渲染单个分组
function renderGroup(containerId, items) {
    const container = document.getElementById(containerId);
    
    if (items.length === 0) {
        container.innerHTML = '<p class="text-slate-400 text-sm italic">暂无记录</p>';
        return;
    }

    container.innerHTML = items.map(item => createCard(item)).join('');
}

// 创建卡片HTML
function createCard(item) {
    const icon = CATEGORY_ICONS[item.category];
    const stars = '★'.repeat(item.rating) + '☆'.repeat(5 - item.rating);
    const noteHtml = item.note ? `<p class="text-sm text-slate-500 mt-2 line-clamp-2">${escapeHtml(item.note)}</p>` : '';
    const typeColor = item.category === 'book' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
    
    // 生成标签胶囊HTML
    const tagsHtml = item.tags && item.tags.length > 0 
        ? `<div class="flex flex-wrap gap-1 mt-2">${item.tags.map(tag => 
            `<span onclick="filterByTag('${escapeHtml(tag)}')" class="tag-pill text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full cursor-pointer hover:bg-indigo-100 transition-colors">${escapeHtml(tag)}</span>`
        ).join('')}</div>` 
        : '';
    
    // 生成进度条HTML
    let progressHtml = '';
    if (item.progress && item.status === 'watching') {
        let percent = 0;
        let progressText = '';
        
        if (item.progress.type === 'page') {
            percent = Math.min(100, Math.round((item.progress.current / item.progress.total) * 100));
            progressText = `${item.progress.current}/${item.progress.total}页`;
        } else if (item.progress.type === 'episode') {
            const current = parseInt(item.progress.current) || 0;
            const total = parseInt(item.progress.total) || 0;
            percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
            progressText = `${item.progress.current}/${item.progress.total}集`;
        } else if (item.progress.type === 'time') {
            progressText = `${item.progress.current}/${item.progress.total}`;
            // 尝试计算时长百分比
            const currentSec = parseTimeToSeconds(item.progress.current);
            const totalSec = parseTimeToSeconds(item.progress.total);
            percent = totalSec > 0 ? Math.min(100, Math.round((currentSec / totalSec) * 100)) : 0;
        }
        
        if (percent > 0) {
            progressHtml = `
                <div class="mt-2">
                    <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>进度 ${percent}%</span>
                        <span>${progressText}</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-1.5">
                        <div class="bg-blue-500 h-1.5 rounded-full transition-all" style="width: ${percent}%"></div>
                    </div>
                </div>
            `;
        }
    }

    return `
        <div class="bg-white rounded-xl border border-slate-200 p-4 card-hover transition-all duration-300">
            <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                    <span class="text-2xl">${icon}</span>
                    <div class="min-w-0 flex-1">
                        <h3 class="font-semibold text-slate-800 truncate">${escapeHtml(item.title)}</h3>
                        <span class="inline-block ${typeColor} text-xs px-2 py-0.5 rounded mt-1">${escapeHtml(item.type)}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="text-amber-400 text-sm">${stars}</span>
                    <button onclick="editRecord('${item.id}')" 
                        class="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="编辑">
                        ✏️
                    </button>
                    <button onclick="confirmDelete('${item.id}')" 
                        class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                        title="删除">
                        🗑️
                    </button>
                </div>
            </div>
            ${progressHtml}
            ${tagsHtml}
            ${noteHtml}
        </div>
    `;
}

// 解析时长字符串为秒数
function parseTimeToSeconds(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
        const min = parseInt(parts[0]) || 0;
        const sec = parseInt(parts[1]) || 0;
        return min * 60 + sec;
    }
    return 0;
}

// ==================== 编辑/删除操作 ====================
// 编辑记录
function editRecord(id) {
    const record = getRecordById(id);
    if (!record) return;

    editingId = id;

    // 填充表单
    document.querySelector(`input[name="category"][value="${record.category}"]`).checked = true;
    updateTypeOptions();
    document.getElementById('title').value = record.title;
    document.getElementById('type').value = record.type;
    setRating(record.rating);
    document.querySelector(`input[name="status"][value="${record.status}"]`).checked = true;
    updateProgressSection();
    document.getElementById('tags').value = record.tags ? record.tags.join('、') : '';
    document.getElementById('note').value = record.note || '';
    
    // 回显进度数据
    if (record.progress && record.status === 'watching') {
        if (record.progress.type === 'page') {
            document.getElementById('progressCurrent').value = record.progress.current;
            document.getElementById('progressTotal').value = record.progress.total;
        } else {
            document.getElementById('progressCurrentEp').value = record.progress.current;
            document.getElementById('progressTotalEp').value = record.progress.total;
        }
    }

    // 更新按钮文字和显示编辑提示
    document.getElementById('submitBtn').textContent = '更新记录';
    document.getElementById('editHint').classList.remove('hidden');

    // 滚动到表单
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 确认删除
function confirmDelete(id) {
    showConfirm('确定要删除这条记录吗？', () => {
        deleteRecord(id);
    });
}

// ==================== 表单重置 ====================
function resetForm() {
    editingId = null;
    document.getElementById('entryForm').reset();
    setRating(0);
    updateTypeOptions();
    document.getElementById('submitBtn').textContent = '添加记录';
    document.getElementById('editHint').classList.add('hidden');
    // 清空进度输入
    document.getElementById('progressCurrent').value = '';
    document.getElementById('progressTotal').value = '';
    document.getElementById('progressCurrentEp').value = '';
    document.getElementById('progressTotalEp').value = '';
}

// ==================== 随机推荐 ====================
function randomRecommend() {
    const data = getAllData();
    const wantRecords = data.filter(item => item.status === 'want');
    
    if (wantRecords.length === 0) {
        showToast('没有"想看"状态的记录可供推荐', 'error');
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * wantRecords.length);
    const record = wantRecords[randomIndex];
    
    showRecommendModal(record);
}

function showRecommendModal(record) {
    const icon = CATEGORY_ICONS[record.category];
    const typeColor = record.category === 'book' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
    const stars = '★'.repeat(record.rating) + '☆'.repeat(5 - record.rating);
    
    const tagsHtml = record.tags && record.tags.length > 0 
        ? `<div class="flex flex-wrap gap-1">
            ${record.tags.map(tag => `<span class="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">${escapeHtml(tag)}</span>`).join('')}
           </div>`
        : '';
    
    const noteHtml = record.note 
        ? `<div class="bg-slate-50 rounded-lg p-3">
            <p class="text-sm text-slate-600">${escapeHtml(record.note)}</p>
           </div>`
        : '';
    
    const content = `
        <div class="text-center mb-4">
            <span class="text-4xl">${icon}</span>
            <h4 class="text-xl font-bold text-slate-800 mt-2">${escapeHtml(record.title)}</h4>
            <span class="inline-block ${typeColor} text-xs px-3 py-1 rounded-full mt-2">${escapeHtml(record.type)}</span>
        </div>
        <div class="flex justify-center items-center gap-2 py-2">
            <span class="text-amber-400">${stars}</span>
        </div>
        ${tagsHtml}
        ${noteHtml}
    `;
    
    document.getElementById('recommendContent').innerHTML = content;
    document.getElementById('recommendModal').classList.remove('hidden');
}

function closeRecommendModal(event) {
    if (event && event.target === event.currentTarget) {
        document.getElementById('recommendModal').classList.add('hidden');
    }
}

function closeRecommendModalBtn() {
    document.getElementById('recommendModal').classList.add('hidden');
}

// ==================== 数据统计 ====================
let statusChart = null;
let categoryChart = null;

function toggleStats() {
    const content = document.getElementById('statsContent');
    const icon = document.getElementById('statsToggleIcon');
    content.classList.toggle('hidden');
    icon.style.transform = content.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    if (!content.classList.contains('hidden')) {
        updateStats();
    }
}

function updateStats() {
    const data = getAllData();
    
    const bookCount = data.filter(item => item.category === 'book').length;
    const movieCount = data.filter(item => item.category === 'movie').length;
    document.getElementById('bookCount').textContent = bookCount;
    document.getElementById('movieCount').textContent = movieCount;
    
    const ratingDist = [0, 0, 0, 0, 0];
    data.forEach(item => {
        if (item.rating >= 1 && item.rating <= 5) {
            ratingDist[item.rating - 1]++;
        }
    });
    const ratingDistHtml = ratingDist.map((count, i) => {
        const filledStars = i + 1;
        const emptyStars = 5 - filledStars;
        const stars = '★'.repeat(filledStars) + '☆'.repeat(emptyStars);
        return `<div>${stars} <span class="text-amber-500 font-medium">${count}</span>条</div>`;
    }).join('');
    document.getElementById('ratingDist').innerHTML = ratingDistHtml || '<div class="text-slate-400">暂无数据</div>';
    
    const statusCounts = {
        want: data.filter(item => item.status === 'want').length,
        watching: data.filter(item => item.status === 'watching').length,
        finished: data.filter(item => item.status === 'finished').length
    };
    
    const statusLabels = ['想看', '在看', '已看完'];
    const statusData = [statusCounts.want, statusCounts.watching, statusCounts.finished];
    const statusColors = ['#8b5cf6', '#3b82f6', '#22c55e'];
    
    if (statusChart) {
        statusChart.data.labels = statusLabels;
        statusChart.data.datasets[0].data = statusData;
        statusChart.update();
    } else {
        const ctx = document.getElementById('statusChart').getContext('2d');
        statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: statusLabels,
                datasets: [{
                    data: statusData,
                    backgroundColor: statusColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }
    
    const categoryLabels = ['书籍', '影视'];
    const categoryData = [bookCount, movieCount];
    const categoryColors = ['#3b82f6', '#f43f5e'];
    
    if (categoryChart) {
        categoryChart.data.datasets[0].data = categoryData;
        categoryChart.update();
    } else {
        const ctx2 = document.getElementById('categoryChart').getContext('2d');
        categoryChart = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryData,
                    backgroundColor: categoryColors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }
}

// ==================== 弹窗和提示 ====================
// 显示提示消息
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 z-50 ${
        type === 'error' ? 'bg-red-500' : 'bg-slate-800'
    } text-white`;
    
    toast.classList.remove('translate-y-20', 'opacity-0');
    
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2500);
}

// 显示确认框
function showConfirm(message, callback) {
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').classList.remove('hidden');
    document.getElementById('confirmBtn').onclick = () => {
        callback();
        closeConfirm();
    };
}

// 关闭确认框
function closeConfirm() {
    document.getElementById('confirmModal').classList.add('hidden');
}

// ==================== 排序功能 ====================
// 加载排序设置
function loadSortSetting() {
    const savedSort = localStorage.getItem(SORT_KEY);
    if (savedSort) {
        currentSort = savedSort;
    }
    document.getElementById('sortSelect').value = currentSort;
}

// 切换排序方式
function changeSort(sortValue) {
    currentSort = sortValue;
    localStorage.setItem(SORT_KEY, sortValue);
    renderList();
}

// 排序数据
function sortData(data) {
    const sorted = [...data];
    
    switch (currentSort) {
        case 'time-desc':
            sorted.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
            break;
        case 'rating-desc':
            sorted.sort((a, b) => b.rating - a.rating);
            break;
        case 'title-asc':
            sorted.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
            break;
    }
    
    return sorted;
}

// ==================== 标签功能 ====================
// 快速添加标签
function addTag(tag) {
    const tagsInput = document.getElementById('tags');
    const currentTags = tagsInput.value.trim();
    
    if (currentTags) {
        // 检查是否已存在该标签
        const existingTags = currentTags.split(/[,，]/).map(t => t.trim());
        if (!existingTags.includes(tag)) {
            tagsInput.value = currentTags + '、' + tag;
        }
    } else {
        tagsInput.value = tag;
    }
    
    tagsInput.focus();
}

// 渲染标签筛选器
function renderTagFilters() {
    const data = getAllData();
    const allTags = new Set();
    
    data.forEach(item => {
        if (item.tags && item.tags.length > 0) {
            item.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    const container = document.getElementById('tagFilterContainer');
    
    if (allTags.size === 0) {
        container.innerHTML = '<span class="text-sm text-slate-400">暂无标签</span>';
        return;
    }
    
    const sortedTags = Array.from(allTags).sort();
    container.innerHTML = sortedTags.map(tag => {
        const isActive = currentTagFilter === tag;
        return `<span onclick="filterByTag('${escapeHtml(tag)}')" 
            class="tag-filter text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600'}">${escapeHtml(tag)}</span>`;
    }).join('');
}

// 按标签筛选
function filterByTag(tag) {
    if (currentTagFilter === tag) {
        currentTagFilter = null;
    } else {
        currentTagFilter = tag;
    }
    renderTagFilters();
    renderList();
    
    if (currentTagFilter) {
        document.getElementById('clearTagFilter').classList.remove('hidden');
    }
}

// 清除标签筛选
function clearTagFilter() {
    currentTagFilter = null;
    renderTagFilters();
    renderList();
    document.getElementById('clearTagFilter').classList.add('hidden');
}

// ==================== 工具函数 ====================
// HTML转义，防止XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
