// gemini2.0配置文件
const API_KEY = 'AIzaSyD_kfC6rkFDZ1xJysWm03M2MPArhaizbis' // 换成自己的apiiKey
export const API_CONFIG = {
  baseURL: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
};

// 模型配置
export const MODEL_CONFIG = {
  // maxOutputTokens: 8192, // 限制一次请求中模型生成 completion 的最大 token 数
  // temperature: 0.6, // 严谨与想象 越低越严谨 官方建议0.6
  // name: 'euzhi',
  // baseModelId: "gemini-1.5-flash",
  // displayName: 'asa',
  // key: API_KEY,
  // description: '你是一个专业的前端工程师，提供前端解决方案。'
}
