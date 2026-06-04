const AccessTokenKey = 'MALL_ACCESS_TOKEN'
const RefreshTokenKey = 'MALL_REFRESH_TOKEN'

export const getAccessToken = (): string => {
  return localStorage.getItem(AccessTokenKey) || ''
}

export const getRefreshToken = (): string => {
  return localStorage.getItem(RefreshTokenKey) || ''
}

export const setToken = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(AccessTokenKey, accessToken)
  localStorage.setItem(RefreshTokenKey, refreshToken)
}

export const removeToken = () => {
  localStorage.removeItem(AccessTokenKey)
  localStorage.removeItem(RefreshTokenKey)
}

export const getTenantId = (): number => {
  return Number(import.meta.env.VITE_TENANT_ID) || 1
}
