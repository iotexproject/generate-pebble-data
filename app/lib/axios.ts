import Axios from "axios"

export const axios = Axios.create({
  baseURL: "/",
})

axios.interceptors.request.use((req) => {
  return req
})

axios.interceptors.response.use(
  (res) => {
    return res
  },
  (err) => {
    console.log(err)
    return Promise.reject(err)
  }
)
