<script setup></script>
<template>
  <div class="container-message">
    <div class="box-item">
      <div class="message-item message-item--user">
        <div class="message-item__content message-item__content--right">
          <div class="message-item__text"></div>
        </div>
        <el-avatar class="message-item__avatar">
          <img src="../images/user.png" />
        </el-avatar>
      </div>

      <div class="message-item message-item--assistant">
        <el-avatar class="message-item__avatar">
          <img src="../images/ai.png" />
        </el-avatar>
        <div class="message-item__content message-item__content--left">
          <div class="message-item__text">思考中</div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.container-message {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.box-item {
  margin-bottom: 12px;
}

.message-item {
  display: grid;
  column-gap: 8px;
}

.message-item--assistant {
  grid-template-columns: 40px auto 1%;
  justify-content: start;
}

.message-item--user {
  grid-template-columns: 0% auto 40px;
  justify-content: end;
}
</style>
