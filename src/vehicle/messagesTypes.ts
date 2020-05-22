import Vehicle from "./index";
import { CommandType } from "./commandTypes";

export enum MessageTypes {
  command = "command",
  data = "data",
}

interface Message {
  uuid: string;
  fromWho: Vehicle | "from earth";
  sayOther?: boolean;
  type: MessageTypes;
}

export interface MessageCommand extends Message {
  type: MessageTypes.command;
  command: CommandType;
}

export interface MessageData extends Message {
  type: MessageTypes.data;
  data: {};
}

export type MessageType = MessageCommand | MessageData | Message;
