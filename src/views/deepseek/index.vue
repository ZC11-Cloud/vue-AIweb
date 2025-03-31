<script setup>
import { Promotion, Delete, EditPen, Brush, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import MessageComp from './components/messageComp.vue'
import { ref, onMounted, nextTick, watch } from 'vue'
import OpenAI from 'openai'
import { API_CONFIG as DEEPSEEK_CONFIG, MODEL_CONFIG, STORAGE_KEYS } from '@/config/deepseek'
import { API_CONFIG as GEMINI_CONFIG, MODEL_CONFIG as GEMINI_MODEL_CONFIG } from '@/config/gemini'
import { getTokens } from '@/apis/modules/deepseek'
import MobileDetect from 'mobile-detect'

// 检测是否是移动端
const isMobile = ref(false)

// 用户输入的提示词
const queryKeys = ref('')

// 请求信息
const queryInfos = ref({
  messages: [],
  model: 'deepseek-chat',
  ...MODEL_CONFIG,
})

// openai实例
const openai = ref(null)

// 当前的模型配置
const currentConfig = ref(DEEPSEEK_CONFIG)

// 对话组件实例
const messageRef = ref(null)

// 对话列表
const sessionList = ref([])

// 当前活跃的对话索引
const activeIndex = ref(-1)

// 当前余额
const totalAmt = ref(0)

// 编辑当前对话索引
const editIndex = ref(-1)

// 加载状态
const loading = ref(false)

// 监听对话列表的变化
watch(
  sessionList,
  (val) => {
    const list = val.map((item, index) => ({
      ...item,
      messages: index === activeIndex.value ? queryInfos.value.messages : item.messages,
    }))
    localStorage.setItem(STORAGE_KEYS.sessionList, JSON.stringify(list))
  },
  { deep: true },
)

// 监听活跃索引
watch(
  activeIndex,
  (val) => {
    localStorage.setItem(STORAGE_KEYS.activeIndex, JSON.stringify(val))
  },
  { deep: true },
)
// 初始化openai实例
const initOpenAI = () => {
  openai.value = new OpenAI({
    ...currentConfig.value,
  })
}

// 初始化对话列表
const initSessionList = () => {
  sessionList.value = JSON.parse(localStorage.getItem(STORAGE_KEYS.sessionList) || '[]')
}

// 初始化活跃索引
const initIndex = () => {
  // 获取缓存的对话列表长度
  const listLen = JSON.parse(localStorage.getItem(STORAGE_KEYS.sessionList) || '[]').length

  // 获取活跃的对话索引，如果不存在默认为-1
  const lastIndex = JSON.parse(localStorage.getItem(STORAGE_KEYS.activeIndex) || '-1')

  if (listLen) {
    activeIndex.value = lastIndex || 0
  } else {
    activeIndex.value = -1
  }

  if (activeIndex.value !== -1) {
    queryInfos.value.messages = sessionList.value[activeIndex.value].messages || []
  }
}

// 初始化Token
const initToken = async () => {
  const res = await getTokens({
    deepseek: 'Y',
    gptToken: DEEPSEEK_CONFIG.apiKey,
  })
  const { balance_infos = [] } = res
  balance_infos.forEach((item) => {
    totalAmt.value += Number(item.total_balance)
  })
}

// 新增对话
const handleAddSession = () => {
  if (loading.value) {
    ElMessage({ type: 'warning', message: '请当前问题查询完成后重试！' })
    return
  }
  sessionList.value.push({
    title: `对话${sessionList.value.length + 1}`,
    crtTime: new Date(),
    messages: [],
  })
  queryInfos.value.messages = []
  activeIndex.value = sessionList.value.length - 1
}

// 清空对话
const handleClearSession = (index) => {
  sessionList.value[index].messages = []
  queryInfos.value.messages = sessionList.value[index].messages
  activeIndex.value = index
}

// 删除对话
const handleDeleteSession = (index = 0) => {
  ElMessageBox.confirm('确定删除当前对话？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      sessionList.value.splice(index, 1)
      if (index == activeIndex.value) {
        activeIndex.value = sessionList.value[index] ? index : --index
      } else if (index < activeIndex.value) {
        activeIndex.value = --activeIndex.value
      }
      queryInfos.value.messages = activeIndex.value > -1 ? sessionList.value[activeIndex.value] : []
      handleChangeSessionIndex(activeIndex.value)
    })
    .catch(() => {})
}

// 编辑对话
const handleFocusInput = (index) => {
  editIndex.value = index
}

// 改变活跃对话
const handleChangeSessionIndex = async (index) => {
  if (loading.value) {
    ElMessage({ type: 'warning', message: '请当前问题查询完成后重试！' })
    return
  }
  activeIndex.value = index
  queryInfos.value.messages = sessionList.value[index]?.messages || []
  await nextTick()
  messageRef.value.scrollBottom()
}

// 处理用户请求
const handleRequest = async () => {
  if (!queryKeys.value) return // 输入为空时，不执行
  if (!openai.value) initOpenAI() // 初始化openai
  if (!sessionList.value.length) {
    handleAddSession()
  }
  queryInfos.value.messages.push({
    role: 'user',
    content: queryKeys.value,
    name: 'asa',
  })

  queryKeys.value = null
  messageRef.value.scrollBottom()

  try {
    loading.value = true
    queryInfos.value.messages.push({
      role: 'assistant',
      content: '',
    })
    if (queryInfos.value.model === 'deepseek-chat') {
      const requestConfig = {
        ...queryInfos.value,
        stream: true,
      }

      const response = await openai.value.chat.completions.create(requestConfig)

      for await (const part of response) {
        queryInfos.value.messages[queryInfos.value.messages.length - 1].content +=
          part.choices[0].delta.content
      }

      messageRef.value.scrollBottom()
    } else if (queryInfos.value.model === 'gemini-chat') {
      const contents = queryInfos.value.messages.slice(0, -1).map((msg) => ({
        parts: [{ text: msg.content }],
        role: msg.role === 'user' ? 'user' : 'model',
      }))

      const response = await fetch(currentConfig.value.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...GEMINI_MODEL_CONFIG,
          contents,
        }),
      })

      if (!response.ok) {
        throw new Error(`Http error! status: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, {
          stream: true,
        })
        const data = JSON.parse(chunk)

        if (data?.candidates?.[0]?.content?.parts?.[0].text) {
          queryInfos.value.messages[queryInfos.value.messages.length - 1].content +=
            data.candidates[0].content.parts[0].text
          messageRef.value.scrollBottom()
        }
      }

      if (!queryInfos.value.messages[queryInfos.value.messages.length - 1].content) {
        throw new Error('未收到有效的 Gemini API 响应')
      }
    }
    loading.value = false
  } catch (error) {
    loading.value = false
    queryInfos.value.messages[queryInfos.value.messages.length - 1].content = error.message
  }
}

// 切换模型
const handleModelChange = (model) => {
  currentConfig.value = model === 'deepseek-chat' ? DEEPSEEK_CONFIG : GEMINI_CONFIG
  initOpenAI()
}

onMounted(async () => {
  initSessionList()
  initIndex()
  initOpenAI()
  initToken()

  // 判断是否为移动端
  const md = new MobileDetect(window.navigator.userAgent)
  isMobile.value = md.mobile()
  await nextTick()
  messageRef.value.scrollBottom()
})
</script>
<template>
  <div class="inner-html-container">
    <div class="page">
      <div class="tips">
        <div class="title">{{ queryInfos.model }}</div>
        <div class="desc" v-if="!isMobile">
          本网站采用本地缓存模式运行，不会留存任何涉及您个人的信息数据，请放心使用。
        </div>
      </div>
      <div class="grid-space-between" :class="!isMobile ? 'grid-box' : ''">
        <div class="left-container" v-if="!isMobile">
          <el-button
            type="primary"
            class="add-btn"
            :icon="Plus"
            size="large"
            @click="handleAddSession"
          >
            新建对话
          </el-button>
          <div class="session-area">
            <div
              class="session-item"
              :class="activeIndex == index ? 'session-item-active' : ''"
              v-for="(item, index) in sessionList"
              :key="index"
              @click="handleChangeSessionIndex(index)"
            >
              <span
                class="normal-node"
                :class="activeIndex == index ? 'active-node' : 'normal-node'"
                v-if="editIndex != index"
                >{{ item.title }}</span
              >
              <el-input
                :ref="`renameRef_${index}`"
                autofocus
                v-model="item.title"
                v-else
                size="small"
                style="width: 120px"
                @blur="editIndex = -1"
                @change="editIndex = -1"
              >
              </el-input>
              <div class="icon-box">
                <el-icon class="icon" color="#fff" @click.stop="handleClearSession(index)">
                  <Brush />
                </el-icon>
                <el-icon class="icon" color="#fff" @click.stop="handleFocusInput(index)">
                  <EditPen />
                </el-icon>
                <el-icon class="icon" color="#fff" @click.stop="handleDeleteSession(index)">
                  <Delete />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
        <div class="container">
          <div class="message-area">
            <MessageComp :messages="queryInfos.messages" ref="messageRef" />
          </div>
          <div class="user-tokens" :class="isMobile ? 'left-space' : ''">
            <span v-if="queryInfos.model == 'deepseek-chat'"
              >当前余额为：￥{{ totalAmt || 0 }}</span
            >
            <span v-else>免费</span>
          </div>
          <div class="input-area" :class="isMobile ? 'left-space' : ''">
            <el-input
              placeholder="请输入内容"
              show-word-limit
              v-model="queryKeys"
              @keydown.enter="
                (e) => {
                  if (e.isComposing || loading) return
                  handleRequest()
                }
              "
            />
            <el-select class="model-select" v-model="queryInfos.model" @change="handleModelChange">
              <el-option label="DeepSeek" value="deepseek-chat" />
              <el-option label="Gemini" value="gemini-chat" />
            </el-select>
            <el-button
              style="height: 40px"
              type="primary"
              @click="handleRequest"
              :disabled="!queryKeys"
              :loading="loading"
            >
              <el-icon>
                <Promotion />
              </el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.inner-html-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: aliceblue;
}

.page {
  width: 94vw;
  height: 94vh;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  border-radius: 12px;
  overflow: hidden;
}
/* 上层提示start */
.tips {
  width: 100%;
  height: 40px;
  background: linear-gradient(90deg, #4dffd5, #2c6efe);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #2c6efe;
}

.desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}
/* 上层提示end */
.grid-box {
  display: grid;
  grid-template-columns: 280px auto;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
}
.grid-space-between {
  width: 100%;
  height: calc(100% - 40px);
}

.left-container {
  background-color: #f9f9f9;
  padding: 16px;
  border: 8px;
  height: calc(94vh - 40px - 32px);
}

.add-btn {
  width: 100%;
  font-size: 15px;
  font-weight: bold;
}
.session-area {
  margin-top: 16px;
  height: calc(100% - 32px);
  overflow-y: auto;
  /* overflow-y: scroll; */
}

.session-area::-webkit-scrollbar {
  width: 4px;
}

.session-area::-webkit-scrollbar-thumb {
  background: rgba(254, 44, 85, 0.3);
  border-radius: 2px;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 6px;
  background-color: rgba(20, 20, 20, 0.6);
  color: #fff;
  cursor: pointer;
}

.session-item:hover {
  background: #000000;
}

.session-item:hover .icon-box {
  opacity: 1;
}
.session-item-active {
  background: rgba(254, 44, 85, 0.2);
  border: 1px solid rgba(254, 44, 85, 0.3);
}
.icon-box {
  opacity: 0;
}

.container {
  width: 100%;
  height: calc(94vh - 40px);
  background: #ffffff;
  padding: 16px;
}

.message-area {
  height: calc(100% - 45px - 8px - 36px);
  width: calc(100% - 12px);
  padding: 8px 8px 0 8px;
}

.user-tokens {
  height: 30px;
  line-height: 30px;
  padding: 0 8px 0 0;
  font-size: 14px;
  color: #c7c8ca;
  user-select: none;
}

.input-area {
  height: 36px;
  display: grid;
  grid-template-columns: auto 120px 80px;
  grid-gap: 10px;
  box-sizing: border-box;
  padding: 0 8px 8px 0;
}

.el-select__wrapper {
  height: 40px;
}
</style>
