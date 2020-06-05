 import { McdnDriver } from './index'

 const driver = new McdnDriver()
 driver.connectSerial('COM5');
 driver.disconnect();
