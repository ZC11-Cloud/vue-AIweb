<script setup>
import { defineProps, nextTick } from 'vue'
import Markdown from 'vue3-markdown-it'
const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
})

const scrollBottom = () => {
  nextTick(() => {
    const div = document.getElementById('messageCompBox')
    div.scrollTop = div.scrollHeight - div.clientHeight
    console.log('scrollBottom方法调用了')
  })
}

defineExpose({
  scrollBottom,
})
</script>
<template>
  <div class="container-message" id="messageCompBox">
    <template v-if="props.messages.length">
      <div class="box-item" v-for="(item, index) in props.messages" :key="`message_${index}`">
        <div
          :class="[
            'message-item',
            item.role === 'assistant' ? 'message-item--assistant' : 'message-item--user',
          ]"
          v-if="item.role === 'assistant' || item.content"
        >
          <el-avatar class="message-item__avatar" v-if="item.role === 'assistant'">
            <img src="../images/ai.png" />
          </el-avatar>
          <div v-else></div>
          <div
            :class="[
              'message-item__content',
              item.role === 'assistant'
                ? 'message-item__content--left'
                : 'message-item__content--right',
            ]"
          >
            <div class="message-item__text">
              <Markdown :source="item.content || '思考中...'" />
            </div>
          </div>
          <el-avatar class="message-item__avatar" v-if="item.role !== 'assistant'">
            <img src="../images/user.png" />
          </el-avatar>
          <div v-else></div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="empty-box">
        <el-empty description="暂无对话信息"></el-empty>
      </div>
    </template>
  </div>
</template>
<style scoped>
.container-message {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.empty-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.box-item {
  margin-bottom: 12px;
}

.message-item {
  display: grid;
  column-gap: 8px;
}

.message-item--user {
  grid-template-columns: 0% auto 40px;
  justify-content: end;
}

.message-item--assistant {
  grid-template-columns: 40px auto 1%;
  justify-content: start;
}

.message-item__avatar {
  width: 36px;
  height: 36px;
  background-color: #ffffff;
  border: 2px solid #2ce9fe;
  padding: 4px;
}

.message-item__content {
  background-color: #efefef;
  position: relative;
  border-radius: 8px;
  padding: 8px;
}

.message-item__content--left::before,
.message-item__content--right::before {
  content: '';
  width: 0;
  height: 0;
  position: absolute;
  border: 5px solid transparent;
  top: 15px;
}

.message-item__content--left::before {
  border-right-color: #00fff7;
  left: -9px;
}

.message-item__content--right::before {
  border-left-color: #00fff7;
  right: -9px;
}

.message-item__text {
  padding: 0rem 12px;
  color: #000000;
  position: relative;
  font-size: 0.875rem;
  line-height: 1.4;
}

.message-item__text p {
  margin: 0.5rem 0;
}

.message-item__text pre {
  margin: 0.5rem 0;
  font-size: 0.8125rem;
  max-width: 100%;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message-item__text code {
  font-size: 0.8125rem;
  max-width: 100%;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
