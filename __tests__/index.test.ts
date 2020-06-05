import { McdnDriver } from '../src/index'

const driver = new McdnDriver()

test('McdnDriver create process MCDN and disconect', () => {
    driver.connectMcdn('COM1')
    expect(driver.connected).toBe(true)
    driver.disconnect()
    expect(driver.connected).toBe(false)

})

test('McdnDriver create process SERIAL and disconect', () => {
     driver.connectSerial(`COM1`)
    expect(driver.connected).toBe(true)
    driver.disconnect()
    expect(driver.connected).toBe(false)
})
