import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import qs from 'qs'
import { config } from './config'
import { getAccessToken, getRefreshToken, removeToken, setToken, getTenantId } from '@/utils/auth'

const { result_code, base_url, request_timeout } = config

const ignoreMsgs = ['无效的刷新令牌', '刷新令牌已过期']
export const isRelogin = { show: false }
let requestList: any[] = []
let isRefreshToken = false
const whiteList: string[] = ['/member/auth/login', '/member/auth/sms-login', '/member/auth/refresh-token']

const service: AxiosInstance = axios.create({
  baseURL: base_url,
  timeout: request_timeout,
  withCredentials: false,
  paramsSerializer: (params) => qs.stringify(params, { allowDots: true })
})

// request interceptor
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let isToken = (config.headers || {}).isToken !== false
    if (isToken && whiteList.some((v) => config.url?.includes(v))) {
      isToken = false
    }
    if (getAccessToken() && isToken) {
      config.headers.Authorization = 'Bearer ' + getAccessToken()
    }
    const tenantId = getTenantId()
    if (tenantId) {
      config.headers['tenant-id'] = tenantId
    }
    const method = config.method?.toUpperCase()
    if (method === 'GET') {
      config.headers['Cache-Control'] = 'no-cache'
      config.headers['Pragma'] = 'no-cache'
    } else if (method === 'POST') {
      const contentType = config.headers['Content-Type'] || config.headers['content-type']
      if (contentType === 'application/x-www-form-urlencoded' && config.data && typeof config.data !== 'string') {
        config.data = qs.stringify(config.data)
      }
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  async (response: AxiosResponse<any>) => {
    let { data } = response
    const config = response.config
    if (!data) {
      throw new Error('请求没有返回值')
    }
    if (response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
      if (response.data.type !== 'application/json') {
        return response.data
      }
      data = await new Response(response.data).json()
    }
    const code = data.code ?? result_code
    const msg = data.msg || '系统错误'
    if (ignoreMsgs.indexOf(msg) !== -1) {
      return Promise.reject(msg)
    } else if (code === 401) {
      if (!isRefreshToken) {
        isRefreshToken = true
        if (!getRefreshToken()) {
          return handleAuthorized()
        }
        try {
          const refreshTokenRes = await refreshToken()
          const tokenData = refreshTokenRes.data.data
          setToken(tokenData.accessToken, tokenData.refreshToken)
          config.headers!.Authorization = 'Bearer ' + getAccessToken()
          requestList.forEach((cb: any) => cb())
          requestList = []
          return service(config)
        } catch (e) {
          requestList.forEach((cb: any) => cb())
          return handleAuthorized()
        } finally {
          requestList = []
          isRefreshToken = false
        }
      } else {
        return new Promise((resolve) => {
          requestList.push(() => {
            config.headers!.Authorization = 'Bearer ' + getAccessToken()
            resolve(service(config))
          })
        })
      }
    } else if (code === 500) {
      ElMessage.error(msg || '服务器内部错误')
      return Promise.reject(new Error(msg))
    } else if (code !== 0 && code !== 200) {
      if (msg === '无效的刷新令牌') {
        return handleAuthorized()
      }
      ElMessage.error(msg)
      return Promise.reject('error')
    } else {
      return data
    }
  },
  (error: AxiosError) => {
    let { message } = error
    if (message === 'Network Error') {
      message = '网络连接异常'
    } else if (message.includes('timeout')) {
      message = '请求超时'
    } else if (message.includes('Request failed with status code')) {
      message = '请求失败：' + message.substr(message.length - 3)
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

const refreshToken = async () => {
  axios.defaults.headers.common['tenant-id'] = getTenantId()
  return await axios.post(base_url + '/member/auth/refresh-token?refreshToken=' + getRefreshToken())
}

const handleAuthorized = () => {
  if (!isRelogin.show) {
    if (window.location.href.includes('login')) {
      return
    }
    isRelogin.show = true
    ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
      showCancelButton: false,
      closeOnClickModal: false,
      showClose: false,
      closeOnPressEscape: false,
      confirmButtonText: '重新登录',
      type: 'warning'
    }).then(() => {
      removeToken()
      isRelogin.show = false
      window.location.href = '/login'
    })
  }
  return Promise.reject('登录已过期')
}

export { service }
