/**
 * Persistent storage service with validation and error handling
 */

interface StorageOptions {
  version?: string
  ttl?: number // Time to live in milliseconds
}

class StorageService {
  private readonly prefix = 'teacherflow_'
  private readonly version = 'v1'

  /**
   * Set a value in localStorage with validation
   */
  set<T>(key: string, value: T, options?: StorageOptions): boolean {
    try {
      if (typeof window === 'undefined') return false

      const storageKey = this.getKey(key)
      const dataToStore = {
        version: options?.version || this.version,
        timestamp: Date.now(),
        ttl: options?.ttl,
        data: value,
      }

      localStorage.setItem(storageKey, JSON.stringify(dataToStore))
      return true
    } catch (error) {
      console.error(`Storage error saving ${key}:`, error)
      return false
    }
  }

  /**
   * Get a value from localStorage with validation
   */
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      if (typeof window === 'undefined') return defaultValue || null

      const storageKey = this.getKey(key)
      const stored = localStorage.getItem(storageKey)

      if (!stored) return defaultValue || null

      const parsed = JSON.parse(stored)

      // Check TTL
      if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
        this.remove(key)
        return defaultValue || null
      }

      return parsed.data as T
    } catch (error) {
      console.error(`Storage error reading ${key}:`, error)
      return defaultValue || null
    }
  }

  /**
   * Remove a value from localStorage
   */
  remove(key: string): void {
    try {
      if (typeof window === 'undefined') return
      const storageKey = this.getKey(key)
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error(`Storage error removing ${key}:`, error)
    }
  }

  /**
   * Clear all TeacherFlow data
   */
  clear(): void {
    try {
      if (typeof window === 'undefined') return
      const keysToRemove: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key))
    } catch (error) {
      console.error('Storage error clearing data:', error)
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined') return false
      const test = '__test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get storage usage info
   */
  getUsageInfo(): { used: number; available: number; percentage: number } {
    try {
      if (typeof window === 'undefined') {
        return { used: 0, available: 0, percentage: 0 }
      }

      let used = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key)
          if (item) {
            used += item.length + key.length
          }
        }
      }

      // Approximate 5MB limit for localStorage
      const available = 5 * 1024 * 1024
      return {
        used,
        available,
        percentage: (used / available) * 100,
      }
    } catch {
      return { used: 0, available: 5 * 1024 * 1024, percentage: 0 }
    }
  }

  /**
   * Backup data to a stringified JSON
   */
  backup(): string {
    try {
      if (typeof window === 'undefined') return ''

      const backup: Record<string, unknown> = {}

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key)
          if (item) {
            backup[key] = JSON.parse(item)
          }
        }
      }

      return JSON.stringify(backup)
    } catch (error) {
      console.error('Backup error:', error)
      return ''
    }
  }

  /**
   * Restore data from backup
   */
  restore(backupData: string): boolean {
    try {
      if (typeof window === 'undefined') return false

      const backup = JSON.parse(backupData)

      for (const [key, value] of Object.entries(backup)) {
        localStorage.setItem(key, JSON.stringify(value))
      }

      return true
    } catch (error) {
      console.error('Restore error:', error)
      return false
    }
  }

  /**
   * Sync storage across tabs using storage events
   */
  onStorageChange(callback: (key: string, newValue: unknown, oldValue: unknown) => void): () => void {
    if (typeof window === 'undefined') return () => {}

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.startsWith(this.prefix)) {
        const newValue = event.newValue ? JSON.parse(event.newValue).data : null
        const oldValue = event.oldValue ? JSON.parse(event.oldValue).data : null
        callback(event.key, newValue, oldValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Return unsubscribe function
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }

  /**
   * Helper to get prefixed key
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }
}

export const storageService = new StorageService()
