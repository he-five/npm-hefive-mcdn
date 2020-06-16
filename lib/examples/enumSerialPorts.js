"use strict";
const McdnDriver = require('../index');
const driver = new McdnDriver();
driver.enumSerialPorts();
driver.on('ports', (ports) => {
    console.log(ports);
});
