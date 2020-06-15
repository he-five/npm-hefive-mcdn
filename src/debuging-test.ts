import {McdnDriver, Commands} from "./index";


const driver = new McdnDriver()
driver.enumSerialPorts()
driver.on('ports', (ports) => {
    console.log(ports);
    driver.openSerialPort('COM3');

 })

driver.on('connected', () => {
    console.log(`CONNECTED`);

    driver.sendCmd(Commands.FW_VER);
    driver.sendCmd(Commands.ENCODER);
    driver.sendCmd(Commands.FOLLOWING_ERROR);

    setTimeout(() => {
        driver.sendStr('ver');
    }, 500)

     setTimeout(() => {
         driver.disconnect()
     }, 1000)
})

driver.on('disconnected', () => {
    console.log(`DISCONNECTED`);
})

driver.on('error', (err) => {
    console.log(`ERROR: ${err}`);
})

driver.on('data', (data) => {
   console.log(`DATA: ${JSON.stringify(data)}`);
})

// driver.openMcdnPort('COM5');
// driver.closePort();


