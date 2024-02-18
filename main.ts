function SENDoBuffer () {
    radio.sendBuffer(oBufferSend.i2c_toBuffer())
}
function fServo (pJoy: number) {
    if (lcd16x2rgb.between(pJoy, 122, 134)) {
        qwiicjoystick.comment("Ruhestellung soll 128 ist auf 128 = 90° anpassen")
        return 90
    } else if (pJoy < 20) {
        qwiicjoystick.comment("Werte < 20 wie 0 behandeln (max links)")
        return 135
    } else if (pJoy > 235) {
        qwiicjoystick.comment("Werte > 235 wie 255 behandeln (max rechts)")
        return 45
    } else {
        qwiicjoystick.comment("Werte von 32 bis 991 auf 46° bis 134° verteilen")
        return Math.round(Math.map(pJoy, 20, 235, 134, 46))
    }
}
input.onButtonEvent(Button.AB, input.buttonEventClick(), function () {
    bMotorPower = !(bMotorPower)
})
function m5Joystick () {
    oBuffer = i2c.i2cReadBuffer(i2c.i2c_eADDR(i2c.eADDR.Joystick_x52), 3)
    iMotor = oBuffer.getUint8(0)
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 12, 15, iMotor, lcd16x2rgb.eAlign.right)
    if (lcd16x2rgb.between(iMotor, 120, 138)) {
        iMotor = 127
    }
    iMotor = 255 - iMotor
    iServo = fServo(oBuffer.getUint8(1))
    fServoDisplay(oBuffer.getUint8(1))
}
function fServoDisplay (pJoy: number) {
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 0, 3, pJoy, lcd16x2rgb.eAlign.right)
    if (pJoy > 0 && pJoy < xmin) {
        xmin = pJoy
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 4, 7, xmin, lcd16x2rgb.eAlign.right)
    } else if (pJoy < 255 && pJoy > xmax) {
        xmax = pJoy
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 8, 11, xmax, lcd16x2rgb.eAlign.right)
    }
}
function qwiicJoystick2 () {
    oBuffer2 = i2c.fromArray2([3])
    oBuffer2.i2cWriteBuffer(i2c.i2c_eADDR(i2c.eADDR.Joystick_x20), true)
    oBuffer = i2c.i2cReadBuffer(i2c.i2c_eADDR(i2c.eADDR.Joystick_x20), 3)
    iMotor = oBuffer.getUint8(0)
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 12, 15, iMotor, lcd16x2rgb.eAlign.right)
    if (lcd16x2rgb.between(iMotor, 124, 132)) {
        iMotor = 128
    }
    iServo = fServo(oBuffer.getUint8(2))
    fServoDisplay(oBuffer.getUint8(2))
}
function qwiicJoystick () {
    aJoy = qwiicjoystick.readArray(qwiicjoystick.qwiicjoystick_eADDR(qwiicjoystick.eADDR.Joystick_x20), qwiicjoystick.eBereich.B_0_255)
    iMotor = aJoy[0]
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 12, 15, iMotor, lcd16x2rgb.eAlign.right)
    if (lcd16x2rgb.between(iMotor, 124, 132)) {
        iMotor = 128
    }
    iServo = fServo(aJoy[1])
    fServoDisplay(aJoy[1])
}
function fBits () {
    b = 0
    b = bit.setBit(b, 7, bMotorPower)
    return b
}
function analogJoystick () {
    iMotor = pins.analogReadPin(AnalogPin.C16)
    lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 12, 15, iMotor, lcd16x2rgb.eAlign.right)
    iMotor = Math.constrain(Math.round(Math.map(iMotor, 240, 784, 255, 0)), 0, 255)
    if (lcd16x2rgb.between(iMotor, 124, 136)) {
        iMotor = 128
    }
    iServo = pins.analogReadPin(AnalogPin.C17)
    iServo = Math.round(Math.map(iServo, 240, 784, 135, 45))
}
let b = 0
let aJoy: number[] = []
let oBuffer2: i2c.i2cclass = null
let iServo = 0
let iMotor = 0
let oBuffer: i2c.i2cclass = null
let bMotorPower = false
let xmax = 0
let xmin = 0
lcd16x2rgb.initLCD(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
radio.setGroup(240)
radio.setTransmitPower(7)
xmin = 128
xmax = 128
basic.pause(1000)
let iFahrstrecke = 1
let oBufferSend = i2c.create(8)
loops.everyInterval(500, function () {
    if (iFahrstrecke == 1) {
        if (bMotorPower) {
            basic.setLedColor(0x00ff00)
        } else {
            basic.setLedColor(0x007fff)
        }
        if (false) {
            m5Joystick()
        } else {
            qwiicJoystick2()
        }
        qwiicjoystick.comment("0 Motor 0..128..255")
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 0, 3, iServo, lcd16x2rgb.eAlign.right)
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 12, 15, iMotor, lcd16x2rgb.eAlign.right)
        qwiicjoystick.comment("1 Servo 0..128..255 -> 45..90..135")
        oBufferSend.setUint8(0, iMotor)
        oBufferSend.setUint8(1, iServo)
        oBufferSend.setUint8(3, fBits())
        SENDoBuffer()
        basic.turnRgbLedOff()
    }
})
