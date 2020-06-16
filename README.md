# npm-hefive-mcdn

Communication driver for HE FIVE's Digital Servo Drives

# Usage
```bash
const {Commands, McdnDriver} = require('@hefive/mcdn')

let driver = new McdnDriver()
driver.enumSerialPorts()

driver.on('ports', (ports) => {
    console.log(ports)
    driver.openSerialPort('COM3')
})
```
