import ruquest from "@/apis/request"
import { data } from "../../../public/server"
const baseUrl = data.deepseekUrl
export function getTokens(param) {
  return ruquest({
    url: baseUrl + "/user/balance",
    method: "get",
    params: param,
  })
}
