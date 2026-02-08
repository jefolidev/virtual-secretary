import Cookies from 'js-cookie'

const TOKEN_KEY = 'access_token'

export const authToken = {
  get: (): string | null => {
    const localStorageToken = localStorage.getItem(TOKEN_KEY)
    if (localStorageToken) {
      return localStorageToken
    }

    const cookieToken = Cookies.get(TOKEN_KEY)
    if (cookieToken) {
      return cookieToken
    }

    return null
  },

  set: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token)
    Cookies.set(TOKEN_KEY, token, {
      expires: 7, // 7 dias
      secure: false, // apenas HTTPS
      sameSite: 'strict',
    })
  },

  remove: (): void => {
    // Remove do localStorage
    localStorage.removeItem(TOKEN_KEY)

    // Remove todos os cookies relacionados
    const cookiesToRemove = [TOKEN_KEY, 'user_data', 'authToken']
    const domain = window.location.hostname

    cookiesToRemove.forEach((cookieName) => {
      Cookies.remove(cookieName)
      Cookies.remove(cookieName, { path: '/' })
      Cookies.remove(cookieName, { path: '/', domain })
      Cookies.remove(cookieName, { path: '/', domain: `.${domain}` })
    })

    // Limpa todos os cookies manualmente via document.cookie
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`
    })

    // Limpa todo o localStorage e sessionStorage
    localStorage.clear()
    sessionStorage.clear()
  },
}
