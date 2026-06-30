import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/onboarding-tour.css'

type DeviceNavigator = Navigator & {
  bluetooth?: { requestDevice?: (...args: unknown[]) => Promise<unknown> }
  usb?: { requestDevice?: (...args: unknown[]) => Promise<unknown> }
  serial?: { requestPort?: (...args: unknown[]) => Promise<unknown> }
  hid?: { requestDevice?: (...args: unknown[]) => Promise<unknown> }
  mediaDevices?: { getUserMedia?: (...args: unknown[]) => Promise<unknown> }
}

const denyAccess = async () => {
  throw new Error('Device access blocked by TeacherFlow client policy')
}

function hardenDeviceAccess(): void {
  const nav = navigator as DeviceNavigator

  if (nav.bluetooth?.requestDevice) nav.bluetooth.requestDevice = denyAccess
  if (nav.usb?.requestDevice) nav.usb.requestDevice = denyAccess
  if (nav.serial?.requestPort) nav.serial.requestPort = denyAccess
  if (nav.hid?.requestDevice) nav.hid.requestDevice = denyAccess
  if (nav.mediaDevices?.getUserMedia) nav.mediaDevices.getUserMedia = denyAccess

  if ('Notification' in window) {
    Notification.requestPermission = async () => 'denied'
  }
}

hardenDeviceAccess()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
