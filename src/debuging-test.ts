import {McdnDriver} from './index'

let driver = new McdnDriver();
driver.connectSerial('com1');
driver.disconnect();
