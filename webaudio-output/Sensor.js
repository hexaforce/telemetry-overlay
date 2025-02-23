if (navigator.getBattery) {
  navigator.getBattery().then((battery) => {  
    console.log(battery)
    battery.addEventListener('levelchange', () => {
      console.log(`Battery level changed: ${battery.level * 100}%`)
    })
  })
}

if ('Gyroscope' in window) {
  try {
    const gyroscope = new Gyroscope({ frequency: 60 })
    gyroscope.addEventListener('reading', () => {
      console.log(`Gyroscope => x: ${gyroscope.x}, y: ${gyroscope.y}, z: ${gyroscope.z}`)
    })
    gyroscope.start()
  } catch (error) {
    console.error('Gyroscopeエラー:', error)
  }
} else {
  console.log('Gyroscope APIはサポートされていません。')
}

window.ondeviceorientation = (event) => {
  console.log(event)
}
window.ondeviceorientationabsolute = (event) => {
  console.log(event)
}
window.ondevicemotion = (event) => {
  console.log(event)
}

if ('Magnetometer' in window) {
  try {
    const magnetometer = new Magnetometer({ frequency: 60 })
    magnetometer.addEventListener('reading', () => {
      console.log(`Magnetometer => x: ${magnetometer.x}, y: ${magnetometer.y}, z: ${magnetometer.z}`)
    })
    magnetometer.start()
  } catch (error) {
    console.error('Magnetometerエラー:', error)
  }
} else {
  console.log('Magnetometer APIはサポートされていません。')
}

if ('Barometer' in window) {
  try {
    const barometer = new Barometer({ frequency: 1 }) // 1Hz で取得
    barometer.addEventListener('reading', () => {
      console.log(`気圧: ${barometer.pressure} hPa`)
    })
    barometer.start()
  } catch (error) {
    console.error('Barometerエラー:', error)
  }
} else {
  console.log('Barometer APIはサポートされていません。')
}
