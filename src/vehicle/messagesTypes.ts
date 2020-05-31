import Vehicle, { statuses } from "./index";
import { CommandType } from "./commandTypes";

export enum MessageTypes {
  command = "command",
  data = "data",
  statusReq = "statusRequest",
  statusRes = "statusResponse",
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

export interface MessageStatusReq extends Message {
  type: MessageTypes.statusReq;
}

export interface MessageStatusRes extends Message {
  type: MessageTypes.statusRes;
  status: statuses;
}

export type MessageType =
  | MessageCommand
  | MessageData
  | MessageStatusReq
  | MessageStatusRes
  | Message;
