function fServo (pJoy: number) {
    if (lcd16x2rgb.between(pJoy, 126, 130)) {
        qwiicjoystick.comment("Ruhestellung soll 512 ist 498 auf 512 = 90° anpassen")
        qwiicjoystick.comment("Ruhestellung soll 128 ist xx auf 128 = 90° anpassen")
        return 90
    } else if (pJoy < 8) {
        qwiicjoystick.comment("Werte < 8 wie 0 behandeln (max links)")
        return 135
    } else if (pJoy > 250) {
        qwiicjoystick.comment("Werte > 250 wie 255 behandeln (max rechts)")
        return 45
    } else {
        qwiicjoystick.comment("Werte von 32 bis 991 auf 46° bis 134° verteilen")
        return Math.round(Math.map(pJoy, 7, 250, 134, 46))
    }
}
function m5Joystick () {
    oBuffer = i2c.i2cReadBuffer(i2c.i2c_eADDR(i2c.eADDR.Joystick_x52), 3)
    iMotor = oBuffer.getUint8(0)
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
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 0, 9, 12, xmax, lcd16x2rgb.eAlign.right)
    }
}
function qwiicJoystick () {
    aJoy = qwiicjoystick.readArray(qwiicjoystick.qwiicjoystick_eADDR(qwiicjoystick.eADDR.Joystick_x20), qwiicjoystick.eBereich.B_0_255)
    iMotor = Math.trunc(aJoy[0])
    iServo = fServo(aJoy[1])
    fServoDisplay(aJoy[1])
}
let iServo = 0
let iMotor = 0
let oBuffer: i2c.i2cclass = null
let xmax = 0
let xmin = 0
let aJoy: number[] = []
lcd16x2rgb.initLCD(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E))
qwiicjoystick.beimStart(qwiicjoystick.qwiicjoystick_eADDR(qwiicjoystick.eADDR.Joystick_x20))
aJoy = qwiicjoystick.readArray(qwiicjoystick.qwiicjoystick_eADDR(qwiicjoystick.eADDR.Joystick_x20), qwiicjoystick.eBereich.A_0_1023)
radio.setGroup(240)
radio.setTransmitPower(7)
xmin = 128
xmax = 128
loops.everyInterval(400, function () {
    let iFahrstrecke = 0
    if (iFahrstrecke == 0) {
        basic.setLedColor(0x007fff)
        qwiicJoystick()
        qwiicjoystick.comment("0 Motor 0..128..255")
        lcd16x2rgb.writeText(lcd16x2rgb.lcd16x2_eADDR(lcd16x2rgb.eADDR_LCD.LCD_16x2_x3E), 1, 0, 3, iServo, lcd16x2rgb.eAlign.right)
        qwiicjoystick.comment("1 Servo 0..128..255 -> 45..90..135")
        qwiicjoystick.setSendeZahl(NumberFormat.Int8LE, qwiicjoystick.eOffset.z0, iMotor)
        qwiicjoystick.setSendeZahl(NumberFormat.Int8LE, qwiicjoystick.eOffset.z1, iServo)
        qwiicjoystick.setSendeZahl(NumberFormat.Int8LE, qwiicjoystick.eOffset.z2, 0)
        radio.sendNumber(qwiicjoystick.getSendeZahl())
        basic.turnRgbLedOff()
    }
})
