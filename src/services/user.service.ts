import { apiClient } from "../api/client"

export interface CambioPasswordRequest {
  currentPassword: string
  newPassword: string
  newPasswordConfirmation: string
}

export async function cambiarPassword(data: CambioPasswordRequest): Promise<void> {
  await apiClient.patch("v1/usuarios/me/password", data)
}
