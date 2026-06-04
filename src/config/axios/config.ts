const config = {
  base_url: import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL,
  result_code: 0,
  default_headers: 'application/json;charset=UTF-8',
  request_timeout: 30000
}

export { config }
