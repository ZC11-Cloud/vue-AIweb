const QUERY_BASE_URL = "http://127.0.0.1:3000"; // 接口请求基础地址
const DEEP_SEEK = "https://api.deepseek.com"; // deepseek-gpt基础地址

/**
 * 注册到window对象上
 */
window.config = {
  baseUrl: QUERY_BASE_URL,
  deepseekUrl: DEEP_SEEK,
};

// 从window对象导出，部分js文件不能直接读取到window，因此直接引入该文件即可
export const data = {
  baseUrl: window.config.baseUrl,
  deepseekUrl: window.config.deepseekUrl,
};
