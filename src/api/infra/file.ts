import request from '@/config/axios'

export const uploadFile = (data: FormData) => {
  return request.upload<{ url: string }>({ url: '/infra/file/upload', data })
}
