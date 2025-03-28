<script setup>
import { Promotion, Delete, EditPen, Brush } from '@element-plus/icons-vue'
import MessageComp from './components/messageComp.vue';
import {ref} from 'vue'
import OpenAI from 'openai'
import { API_CONFIG as DeepSeek_CONFIG, MODEL_CONFIG, STORAGE_KEYS } from '@/config/deepseek'
// 用户输入的提示词
const queryKeys = ref('')

// 请求信息
const queryInfos = ref({
  messages: [],
  model: "deepseek-chat",
  ...MODEL_CONFIG,
})

// openai实例
const openai = ref(null)

// 当前的模型配置
const currentConfig = ref(DeepSeek_CONFIG)

// 对话组件实例
const messageRef = ref(null)

const initOpenAI = () => {
  openai.value = new OpenAI({
    ...currentConfig.value,
  })
}
// 处理用户请求
const handleRequest = async () => {
  console.log("用户正在发起请求")
  if (!queryKeys.value) return; // 输入为空时，不执行
  if (!openai.value) initOpenAI() // 初始化openai

  queryInfos.value.messages.push({
    role: "user",
    content: queryKeys.value,
    name: "asa"
  })

  queryKeys.value = null
  messageRef.value.scrollBottom()

  try {
    queryInfos.value.messages.push({
      role: "assistant",
      content: "",
    })
    if (queryInfos.value.model === "deepseek-chat") {
      const requestConfig = {
        ...queryInfos.value,
        stream: true,
      }

      const response = await openai.value.chat.completions.create(requestConfig);

      for await (const part of response) {
        queryInfos.value.messages[queryInfos.value.messages.length - 1].content += part.choices[0].delta.content;
      }
    }
  } catch(error) {
    queryInfos.value.messages[queryInfos.value.messages.length - 1].content = error.message
  }

}
</script>
<template>
  <div class="inner-html-container">
    <div class="page">
      <div class="tips">
        <div class="title">deepseek</div>
        <div class="desc">
          本网站采用本地缓存模式运行，不会留存任何涉及您个人的信息数据，请放心使用。
        </div>
      </div>
      <div class="grid-space-between grid-box">
        <div class="left-container">
          <div class="session-area">
            <div class="session-item">
              <span class="active-node">对话1</span>
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
            <div class="session-item">
              <span class="normal-node">对话2</span>
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
          <div class="user-tokens">
            <span>当前余额为：￥0</span>
          </div>
          <div class="input-area">
            <el-input placeholder="请输入内容" show-word-limit v-model="queryKeys" />
            <el-select class="model-select">
              <el-option label="DeepSeek" value="deepseek-chat" />
              <el-option label="Gemini" value="gemini-chat" />
            </el-select>
            <el-button style="height: 40px" type="primary"
            @click="handleRequest">
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
</style>
