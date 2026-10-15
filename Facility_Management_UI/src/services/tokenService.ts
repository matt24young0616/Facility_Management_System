import IdentityManager from '@arcgis/core/identity/IdentityManager'

interface TokenResponse {
  token: string
}

let token: string | null = null

export async function registerArcGISToken() {

  if (token) return token

  const response = await fetch('http://localhost:3000/getToken')
  const data: TokenResponse = await response.json()

  token = data.token

  IdentityManager.registerToken({
    server: 'https://forjesus.maps.arcgis.com/',
    token: data.token,
    expires: Date.now() + 60 * 60 * 1000
  })

  return token
}