import {McdnDriver} from './index'
import {Commands} from "./mcdn-cmd";

const driver = new McdnDriver()
driver.enumSerialPorts()
driver.on('ports', (ports) => {
    console.log(ports);
    driver.openSerialPort('COM8');
    driver.sendCmd(Commands.FW_VER);
})

// driver.openMcdnPort('COM5');
// driver.closePort();
//driver.getFwVersion();
// driver.sendStr( cmd : string);

//
// driver.on('error', err)
driver.on('data', (data) => {
   console.log(`CLIENT DATA: ${JSON.stringify(data)}`);
})

// Commands.ENCODER 'enc'
// Commands.FOLLOWING-ERROR 'err'

