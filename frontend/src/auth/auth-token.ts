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
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(TOKEN_KEY, { path: '/' })
    Cookies.remove('user_data')
    Cookies.remove('user_data', { path: '/' })

    // Limpa outros dados do localStorage relacionados ao auth
    localStorage.clear()
  },
}
