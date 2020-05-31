// @ts-ignore
import * as YUKA from "yuka/build/yuka.module";
import * as THREE from "three/src/Three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { v4 } from "uuid";

import vehicleGeometry from "./vehicleGeometry";
import vehicleMaterial from "./vehicleMaterial";
import {
  MessageCommand,
  MessageStatusRes,
  MessageType,
  MessageTypes,
} from "./messagesTypes";
import {
  commandActions,
  CommandFormSquire,
  CommandMove,
  CommandSetStatus,
} from "./commandTypes";
import { distance, numberInColumn, numberInRow } from "../index";

const messageDelay = 0.0; //seconds
const messageDistance = 40;
const separationWeight = 100;
const statsUpdateTime = 120; // 60 frames / 20 upd time = 0.5 sec

export enum statuses {
  free = "free",
  inConstrSq = "inConstructionSquire",
  inConstrTr = "inConstructionTriangle",
}

export default class Vehicle extends YUKA.Vehicle {
  label: CSS2DObject;
  uuid: string;
  status: statuses = statuses.free;
  currentArriveBehavior: {
    behavior: YUKA.ArriveBehavior;
    target?: YUKA.Vector3;
    weight?: Number;
  };
  currentSeparationBehavior: {
    behavior: YUKA.SeparationBehavior;
    weight?: Number;
  };
  teamMembers: Vehicle[];
  messageStore: MessageType[] = [];
  _: YUKA.Vehicle;

  time: number = 0;

  functionInUpdate: () => void = () => {};

  constructor(
    scene: { add: (arg0: THREE.Mesh) => void },
    entityManager: { add: (arg0: any) => void },
    vehiclesArr: Vehicle[],
    initialPosition: YUKA.Vector3
  ) {
    super();
    this.uuid = v4();
    const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
    vehicleMesh.matrixAutoUpdate = false;

    this.setLabel("q");
    vehicleMesh.add(this.label);

    this._ = this as YUKA.Vehicle;
    this._.position = initialPosition;
    this._.maxSpeed = 7;
    this._.maxTurnRate = 2;
    this._.updateNeighborhood = true;
    this._.neighborhoodRadius = messageDistance;
    this._.smoother = new YUKA.Smoother(30);
    this._.boundingRadius = vehicleGeometry.boundingSphere.radius;
    this._.setRenderComponent(vehicleMesh, this.sync);

    this.initBehaviors(vehiclesArr);

    scene.add(vehicleMesh);
    entityManager.add(this as YUKA.Vehicle);
    vehiclesArr.push(this as YUKA.Vehicle);
    this.teamMembers = vehiclesArr;
  }

  initBehaviors(vehiclesArr: Vehicle[]) {
    const obstacleAvoidanceBehavior = new YUKA.ObstacleAvoidanceBehavior(
      vehiclesArr
    );
    obstacleAvoidanceBehavior.brakingWeight = 1;
    this._.steering.add(obstacleAvoidanceBehavior);
  }

  sync(
    entity: { worldMatrix: any },
    renderComponent: { matrix: { copy: (arg0: any) => void } }
  ) {
    renderComponent.matrix.copy(entity.worldMatrix);
  }

  update(delta: Number): Vehicle {
    this.time++;
    if (!(this.time % statsUpdateTime)) {
      this.time = 0;
      this.functionInUpdate();
    }
    return super.update(delta);
  }

  setFuncInUpdate(fn: () => void) {
    this.functionInUpdate = fn;
  }

  setTargetPosition(tp: YUKA.Vector3 | { x?: number; y?: number; z?: number }) {
    const pos = tp.length
      ? tp
      : new YUKA.Vector3(tp.x || 0, tp.y || 0, tp.z || 0);
    this.enable();

    const ArriveBehavior = new YUKA.ArriveBehavior(pos);

    if (this.currentArriveBehavior) {
      this._.steering.remove(this.currentArriveBehavior.behavior);
    }
    this.currentArriveBehavior = {
      behavior: ArriveBehavior,
      target: pos,
    };
    this._.steering.add(ArriveBehavior);
  }

  switchSeparateBehavior(mode: Boolean, weight?: Number) {
    if (mode) {
      if (
        this.currentSeparationBehavior &&
        this.currentSeparationBehavior.behavior
      ) {
        this._.steering.remove(this.currentSeparationBehavior.behavior);
      }
      const separationBehavior = new YUKA.SeparationBehavior();
      separationBehavior.weight = weight || 20;
      this.currentSeparationBehavior = {
        behavior: separationBehavior,
        weight: weight || 20,
      };
      this._.steering.add(separationBehavior);
    } else {
      if (
        !this.currentSeparationBehavior ||
        !this.currentSeparationBehavior.behavior
      ) {
        return;
      }
      this._.steering.remove(this.currentSeparationBehavior.behavior);
    }
  }

  buildSquire(to: YUKA.Vector3) {
    const sendCoord = (v: Vehicle, x: number, z: number) => {
      this.sendMessage(v, {
        uuid: v4(),
        fromWho: this,
        type: MessageTypes.command,
        command: {
          action: commandActions.move,
          to: new YUKA.Vector3(x, 0, z),
        },
      });
    };

    const team = this.teamMembers.filter((tm) => tm !== this);

    for (let i = 0; i < numberInColumn; i++) {
      for (let j = 0; j < numberInRow; j++) {
        if (team[i * numberInRow + j])
          sendCoord(
            team[i * numberInRow + j],
            to.x - i * distance,
            to.z - j * distance
          );
      }
    }

    this.setTargetPosition({
      x: to.x - (numberInColumn - 1) * distance,
      z: to.z - (numberInRow - 1) * distance,
    });
  }

  buildCircle(to: YUKA.Vector3) {
    const sendCoord = (v: Vehicle, x: number, z: number) => {
      this.sendMessage(v, {
        uuid: v4(),
        fromWho: this,
        type: MessageTypes.command,
        command: {
          action: commandActions.move,
          to: new YUKA.Vector3(x, 0, z),
        },
      });
    };

    const team = this.teamMembers.filter((tm) => tm !== this);

    team.forEach((tm) => {
      this.sendMessage(tm, {
        uuid: v4(),
        fromWho: this,
        type: MessageTypes.command,
        command: {
          action: commandActions.move,
          to,
        },
      });
      this.sendMessage(tm, {
        uuid: v4(),
        fromWho: this,
        type: MessageTypes.command,
        command: {
          action: commandActions.separationEnable,
        },
      });
    });

    this.setTargetPosition(to);
    this.switchSeparateBehavior(true);
  }

  setStatus(status: statuses) {
    this.status = status;
  }

  sayConsole(something?: string, fullName?: boolean) {
    console.log(
      `${fullName ? this.uuid : this.uuid.substring(33, 36)}: ${
        something || "it's me"
      }`
    );
  }

  sendMessage(receiver: Vehicle, message: MessageType) {
    // if (this._.neighbors.find((nei: Vehicle) => nei === receiver))
    setTimeout(() => super.sendMessage(receiver, "", messageDelay, message));
  }

  sendMessageOther(message: MessageType) {
    this.teamMembers.forEach((tm) => this.sendMessage(tm, message));
  }

  handleMessage(message: YUKA.Telegram) {
    const msg: MessageType = message.data;
    if (this.messageStore.filter((m) => m.uuid === msg.uuid).length !== 0)
      return;
    this.messageStore.push(msg);
    // console.log(msg);
    switch (msg.type) {
      case MessageTypes.command:
        switch ((msg as MessageCommand).command.action) {
          case commandActions.move:
            if (msg.sayOther) this.sendMessageOther(msg);
            this.switchSeparateBehavior(true, 3);
            this.setTargetPosition(
              ((msg as MessageCommand).command as CommandMove).to
            );
            break;

          case commandActions.formCircle: {
            const { to } = (msg as MessageCommand).command as CommandMove;
            this.buildCircle(to);
            break;
          }

          case commandActions.formSquire: {
            const { to } = (msg as MessageCommand).command as CommandFormSquire;
            this.buildSquire(to);
            break;
          }

          case commandActions.separationEnable:
            if (msg.sayOther) this.sendMessageOther(msg);
            this.switchSeparateBehavior(true, separationWeight);
            break;

          case commandActions.separationDisable:
            if (msg.sayOther) this.sendMessageOther(msg);
            this.switchSeparateBehavior(false);
            break;

          case commandActions.setStatus:
            if (msg.sayOther) this.sendMessageOther(msg);
            this.setStatus(
              ((msg as MessageCommand).command as CommandSetStatus).status
            );
            break;

          default:
            this.sayConsole("wrong command");
        }
        break;

      case MessageTypes.data:
        if (msg.sayOther) this.sendMessageOther(msg);
        break;

      case MessageTypes.statusReq:
        this.sendMessage(<Vehicle>msg.fromWho, {
          uuid: v4(),
          fromWho: this,
          type: MessageTypes.statusRes,
          status: this.status,
        });
        break;

      case MessageTypes.statusRes:
        break;

      default:
        this.sayConsole("wrong message format");
    }
    return true;
  }

  getInfo(): {} {
    const { x, y, z } = this._.position;
    return {
      id: this.uuid,
      status: this.status,
      speed: this._.getSpeed().toFixed(2),
      x: x.toFixed(2),
      y: y.toFixed(2),
      z: z.toFixed(2),
    };
  }

  enable() {
    this._.active = true;
  }

  disable() {
    this._.active = false;
  }

  private static createDivLabel(text: string): HTMLDivElement {
    const div = document.createElement("div");
    div.className = "label";
    div.textContent = text;
    div.style.marginTop = "-1em";
    return div;
  }

  private setLabel(name: string): CSS2DObject {
    this.label = new CSS2DObject(
      Vehicle.createDivLabel(`${name}-${this.uuid.substring(33, 36)}`)
    );
    this.label.position.set(0, 0, 0);
    return this.label;
  }

  // updateLabel(): CSS2DObject {
  //   this.label.element = Vehicle.createDivLabel(this.getInfo());
  //   return this.label;
  // }
}
