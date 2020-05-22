// @ts-ignore
import * as YUKA from "yuka/build/yuka.module";

export enum commandActions {
  move = "move",
  formSquire = "formSquire",
  formCircle = "formCircle",
  separationEnable = "separationEnable",
  separationDisable = "separationDisable",
}

interface Command {
  action: commandActions;
}

export interface CommandMove extends Command {
  action: commandActions.move;
  to: YUKA.Vector3 | { x?: number; y?: number; z?: number };
}

export interface CommandFormSquire extends Command {
  action: commandActions.formSquire;
  to: YUKA.Vector3 | { x?: number; y?: number; z?: number };
}

export interface CommandFormCircle extends Command {
  action: commandActions.formCircle;
  to: YUKA.Vector3 | { x?: number; y?: number; z?: number };
}

export interface CommandSeparationEnable extends Command {
  action: commandActions.separationEnable;
}

export interface CommandSeparationDisable extends Command {
  action: commandActions.separationDisable;
}

export type CommandType =
  | CommandMove
  | CommandFormSquire
  | CommandFormCircle
  | CommandSeparationEnable
  | CommandSeparationDisable
  | Command;
