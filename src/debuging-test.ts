import {McdnDriver, Commands} from "./index";


const driver = new McdnDriver()
driver.enumSerialPorts()
driver.on('ports', (ports) => {
    console.log(ports);
    driver.openSerialPort('COM3');
    driver.sendCmd(Commands.FW_VER);
    driver.sendCmd(Commands.ENCODER);
    driver.sendCmd(Commands.FOLLOWING_ERROR);
 })

// driver.openMcdnPort('COM5');
// driver.closePort();

// driver.sendStr( cmd : string);

//
driver.on('error', (err) => {
    console.log(`ERROR: ${err}`);
})

driver.on('data', (data) => {
   console.log(`DATA: ${JSON.stringify(data)}`);
})


