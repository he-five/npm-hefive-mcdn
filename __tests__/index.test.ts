import { McdnDriver } from '../src/index'

test('McdnDriver create process ', () => {
    let driver = new McdnDriver();
    driver.connectMcdn('COM1')
    expect(driver.connected).toBe(true)
})
