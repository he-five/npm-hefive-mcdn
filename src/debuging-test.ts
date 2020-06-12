import {McdnDriver, Commands} from "./index";


const driver = new McdnDriver()
driver.enumSerialPorts()
driver.on('ports', (ports) => {
    console.log(ports);
    driver.openSerialPort('COM3');

    setTimeout(()=> {driver.sendCmd(Commands.FW_VER);}, 1000)

})

// driver.openMcdnPort('COM5');
// driver.closePort();
//driver.getFwVersion();
// driver.sendStr( cmd : string);

//
driver.on('error', (err) => {
    console.log(`CLIENT ERROR: ${err}`);
})

driver.on('data', (data) => {
   console.log(`CLIENT DATA: ${JSON.stringify(data)}`);
})

// Commands.ENCODER 'enc'
// Commands.FOLLOWING-ERROR 'err'

