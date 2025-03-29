import axios from "axios";

const service = axios.create({
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
})

service.interceptors.request.use(
  (config) => {
    console.log("deepseek", config)
    if (config.params.deepseek == "Y" || config.data.deepseek == "Y") {
      const token = config.params.gptToken || config.data.gptToken
      config.headers["Authorization"] = "Bearer " + token
    }

    if (sessionStorage.getItem("token")) {
      const token = sessionStorage.getItem("token")
      config.headers["Authorization"] = "Bearer " + token
    }

    return config
  },
  (error) => {
    console.log("deepseek", error)
    return Promise.reject(error);
  }
)

service.interceptors.response.use(
  (response) => {
    console.log("deepseek", response)
    return response.data
  },
  (error) => {
    console.log("deepseek", error)
    if (error.response) {
      if (error.response.status === 0) {
        error.message = "服务器发生错误，请检查服务器。"
      }
    }
  }
)

export default service
