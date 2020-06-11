

 //
import { McdnDriver } from './index'

const driver = new McdnDriver()
driver.enumSerialPorts()
driver.on('ports', (ports) => {
    console.log(ports);
})
// driver.openSerialPort('COM5');
// driver.openMcdnPort('COM5');
// driver.closePort();
// driver.getFwVersion();
// driver.sendStr( cmd : string);
// driver.sendCmd( cmd : Commands.GOTO_POS(pos: number));
//
// driver.on('error', err)
// driver.on('data', data)

// Commands.ENCODER 'enc'
// Commands.FOLLOWING-ERROR 'err'

