import { create } from 'zustand'
import { User, AuthState } from '../types'
import { storageService } from '../utils/storageService'
import { validationService } from '../utils/validationService'
import { decodeGoogleToken } from '../config/googleAuth'

interface LoginError {
  field: string
  message: string
}

export const useAuthStore = create<
  AuthState & {
    loginError: LoginError | null
    setLoginError: (error: LoginError | null) => void
    clearAuth: () => void
    loginWithGoogle: (googleToken: string) => void
  }
>((set) => {
  // Load user from localStorage with validation
  let initialUser: User | null = null
  try {
    const savedUser = storageService.get<User>('user')
    if (savedUser && savedUser.id && savedUser.email && savedUser.tenantId) {
      initialUser = savedUser
    }
  } catch (error) {
    console.error('Error loading user from storage:', error)
  }

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    loginError: null,

    setLoginError: (error) => {
      set({ loginError: error })
    },

    loginWithGoogle: (googleToken: string) => {
      // Decode the Google token
      const profile = decodeGoogleToken(googleToken)

      if (!profile) {
        set({
          loginError: {
            field: 'google',
            message: 'Erro ao processar token do Google. Por favor, tente novamente.',
          },
        })
        return
      }

      // Validate email from Google
      if (!profile.email || !validationService.isValidEmail(profile.email)) {
        set({
          loginError: {
            field: 'google',
            message: 'Email do Google inválido.',
          },
        })
        return
      }

      // Create user object from Google profile
      const googleUser: User = {
        id: `google-${profile.id}`,
        name: profile.name || 'User',
        email: profile.email,
        role: 'OWNER',
        tenantId: `tenant-${profile.email.split('@')[0]}`,
        onboardingComplete: false,
        lessonTypes: [],
      }

      // Save to storage
      const saved = storageService.set('user', googleUser)
      if (!saved) {
        set({
          loginError: {
            field: 'storage',
            message: 'Erro ao salvar dados. Por favor, verifique as permissões do navegador.',
          },
        })
        return
      }

      set({ user: googleUser, isAuthenticated: true, loginError: null })
    },

    login: (email: string, password: string) => {
      // Clear previous errors
      set({ loginError: null })

      // Validate email
      const sanitizedEmail = validationService.sanitizeEmail(email)
      if (!validationService.isValidEmail(sanitizedEmail)) {
        set({
          loginError: {
            field: 'email',
            message: 'Email inválido. Por favor, verifique o formato.',
          },
        })
        return
      }

      // Validate password
      if (!password || password.length < 6) {
        set({
          loginError: {
            field: 'password',
            message: 'Senha deve ter no mínimo 6 caracteres',
          },
        })
        return
      }

      // Mock login validation
      if (password.length < 6 || !password.match(/[0-9]/)) {
        set({
          loginError: {
            field: 'password',
            message: 'A senha deve conter letras e números',
          },
        })
        return
      }

      // Create user object
      const mockUser: User = {
        id: `user-${Date.now()}`,
        name: 'Professor',
        email: sanitizedEmail,
        role: 'OWNER',
        tenantId: `tenant-${sanitizedEmail.split('@')[0]}`,
        onboardingComplete: false,
        lessonTypes: [],
      }

      // Save to storage
      const saved = storageService.set('user', mockUser)
      if (!saved) {
        set({
          loginError: {
            field: 'storage',
            message: 'Erro ao salvar dados. Por favor, verifique as permissões do navegador.',
          },
        })
        return
      }

      set({ user: mockUser, isAuthenticated: true, loginError: null })
    },

    logout: () => {
      storageService.remove('user')
      set({ user: null, isAuthenticated: false, loginError: null })
    },

    setUser: (user: User | null) => {
      if (user) {
        // Validate user object
        if (!user.id || !user.email || !user.tenantId) {
          console.error('Invalid user object:', user)
          return
        }
        const saved = storageService.set('user', user)
        if (!saved) {
          console.error('Failed to save user to storage')
          return
        }
      } else {
        storageService.remove('user')
      }
      set({ user, isAuthenticated: !!user })
    },

    setOnboardingComplete: (complete: boolean) => {
      set((state) => {
        if (state.user) {
          const updatedUser = { ...state.user, onboardingComplete: complete }
          const saved = storageService.set('user', updatedUser)
          if (saved) {
            return { user: updatedUser }
          }
        }
        return {}
      })
    },

    clearAuth: () => {
      storageService.remove('user')
      set({ user: null, isAuthenticated: false, loginError: null })
    },
  }
})

