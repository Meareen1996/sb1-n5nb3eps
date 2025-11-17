/**
 * App Bridge Service
 *
 * This service provides a bridge between the H5 app and native app features.
 * It handles communication with the native app for camera, QR scanner, and file picker.
 */

export interface AppBridgeImageResult {
  uri: string
  base64?: string
  width: number
  height: number
  fileSize: number
}

export interface AppBridgeQRResult {
  data: string
  type: string
}

class AppBridgeService {
  private isNativeApp(): boolean {
    // Check if running inside native app
    return !!(window as any).webkit?.messageHandlers || !!(window as any).AndroidBridge
  }

  /**
   * Open camera to take a photo
   */
  async openCamera(): Promise<AppBridgeImageResult | null> {
    if (this.isNativeApp()) {
      return new Promise((resolve) => {
        // iOS
        if ((window as any).webkit?.messageHandlers?.openCamera) {
          (window as any).webkit.messageHandlers.openCamera.postMessage({})

          // Listen for response
          const handler = (event: any) => {
            if (event.detail?.type === 'camera_result') {
              window.removeEventListener('native_response', handler)
              resolve(event.detail.data)
            }
          }
          window.addEventListener('native_response', handler)
        }
        // Android
        else if ((window as any).AndroidBridge?.openCamera) {
          const result = (window as any).AndroidBridge.openCamera()
          resolve(result ? JSON.parse(result) : null)
        } else {
          resolve(null)
        }
      })
    } else {
      // Fallback for web testing - use file input
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.capture = 'environment'

        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = () => {
              resolve({
                uri: URL.createObjectURL(file),
                base64: reader.result as string,
                width: 0,
                height: 0,
                fileSize: file.size,
              })
            }
            reader.readAsDataURL(file)
          } else {
            resolve(null)
          }
        }

        input.click()
      })
    }
  }

  /**
   * Open image picker from gallery
   */
  async openImagePicker(multiple: boolean = false): Promise<AppBridgeImageResult[] | null> {
    if (this.isNativeApp()) {
      return new Promise((resolve) => {
        const params = { multiple }

        // iOS
        if ((window as any).webkit?.messageHandlers?.openImagePicker) {
          (window as any).webkit.messageHandlers.openImagePicker.postMessage(params)

          const handler = (event: any) => {
            if (event.detail?.type === 'image_picker_result') {
              window.removeEventListener('native_response', handler)
              resolve(event.detail.data)
            }
          }
          window.addEventListener('native_response', handler)
        }
        // Android
        else if ((window as any).AndroidBridge?.openImagePicker) {
          const result = (window as any).AndroidBridge.openImagePicker(multiple)
          resolve(result ? JSON.parse(result) : null)
        } else {
          resolve(null)
        }
      })
    } else {
      // Fallback for web testing
      return new Promise((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.multiple = multiple

        input.onchange = async (e) => {
          const files = Array.from((e.target as HTMLInputElement).files || [])
          if (files.length > 0) {
            const results = await Promise.all(
              files.map(file => {
                return new Promise<AppBridgeImageResult>((resolveFile) => {
                  const reader = new FileReader()
                  reader.onload = () => {
                    resolveFile({
                      uri: URL.createObjectURL(file),
                      base64: reader.result as string,
                      width: 0,
                      height: 0,
                      fileSize: file.size,
                    })
                  }
                  reader.readAsDataURL(file)
                })
              })
            )
            resolve(results)
          } else {
            resolve(null)
          }
        }

        input.click()
      })
    }
  }

  /**
   * Open QR code scanner
   */
  async openQRScanner(): Promise<AppBridgeQRResult | null> {
    if (this.isNativeApp()) {
      return new Promise((resolve) => {
        // iOS
        if ((window as any).webkit?.messageHandlers?.openQRScanner) {
          (window as any).webkit.messageHandlers.openQRScanner.postMessage({})

          const handler = (event: any) => {
            if (event.detail?.type === 'qr_scan_result') {
              window.removeEventListener('native_response', handler)
              resolve(event.detail.data)
            }
          }
          window.addEventListener('native_response', handler)
        }
        // Android
        else if ((window as any).AndroidBridge?.openQRScanner) {
          const result = (window as any).AndroidBridge.openQRScanner()
          resolve(result ? JSON.parse(result) : null)
        } else {
          resolve(null)
        }
      })
    } else {
      // Fallback for web testing - show alert
      const result = prompt('Enter QR code data (for testing):')
      return result ? { data: result, type: 'QR_CODE' } : null
    }
  }

  /**
   * Navigate back in native app
   */
  goBack(): void {
    if (this.isNativeApp()) {
      // iOS
      if ((window as any).webkit?.messageHandlers?.goBack) {
        (window as any).webkit.messageHandlers.goBack.postMessage({})
      }
      // Android
      else if ((window as any).AndroidBridge?.goBack) {
        (window as any).AndroidBridge.goBack()
      }
    } else {
      window.history.back()
    }
  }

  /**
   * Get user info from native app
   */
  async getUserInfo(): Promise<{ name?: string; email?: string; phone?: string } | null> {
    if (this.isNativeApp()) {
      return new Promise((resolve) => {
        // iOS
        if ((window as any).webkit?.messageHandlers?.getUserInfo) {
          (window as any).webkit.messageHandlers.getUserInfo.postMessage({})

          const handler = (event: any) => {
            if (event.detail?.type === 'user_info_result') {
              window.removeEventListener('native_response', handler)
              resolve(event.detail.data)
            }
          }
          window.addEventListener('native_response', handler)
        }
        // Android
        else if ((window as any).AndroidBridge?.getUserInfo) {
          const result = (window as any).AndroidBridge.getUserInfo()
          resolve(result ? JSON.parse(result) : null)
        } else {
          resolve(null)
        }
      })
    }
    return null
  }
}

export const appBridge = new AppBridgeService()
