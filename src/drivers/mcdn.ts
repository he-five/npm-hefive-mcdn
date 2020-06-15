import { ServiceCommands } from "./mcdn-cmd";
import {Commands} from "../commands";

class MCDN {
  constructor () {}
  public connect () {}
  public disconnect () {}
  public sendCmd(cmd : Commands | ServiceCommands){}
  public sendStr(cmd : string){}

}

export { MCDN }
