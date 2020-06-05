"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const driver = new index_1.McdnDriver();
driver.connectSerial('COM5');
driver.getFwVersion();
//driver.disconnect();
