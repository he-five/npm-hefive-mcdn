import { McdnDriver } from '../index'

// let driver : Index | null = null
//
// beforeEach(() => {
//   driver = new Index();
// });

test('Connect MCDN', () => {
  let driver = new McdnDriver()
  driver.connectMcdn('COM1')
  expect(driver.connected).toBe(true)
})

test('Connect Serial', () => {
  let driver = new McdnDriver()
  driver.connectSerial('COM2')
  expect(driver.connected).toBe(true)
})
