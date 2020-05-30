// @ts-ignore
import * as YUKA from "yuka/build/yuka.module";
import * as THREE from "three/src/Three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { v4 } from "uuid";

import vehicleGeometry from "./vehicleGeometry";
import vehicleMaterial from "./vehicleMaterial";
import { MessageCommand, MessageType, MessageTypes } from "./messagesTypes";
import { commandActions, CommandMove } from "./commandTypes";

const messageDelay = 0.01; //seconds
const messageDistance = 40;
const separationWeight = 140;

export default class Vehicle extends YUKA.Vehicle {
  label: CSS2DObject;
  uuid: string;
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

    this.setLabel("k");
    vehicleMesh.add(this.label);

    (this as YUKA.Vehicle).position = initialPosition;
    (this as YUKA.Vehicle).maxSpeed = 7;
    (this as YUKA.Vehicle).maxTurnRate = 2;
    (this as YUKA.Vehicle).updateNeighborhood = true;
    (this as YUKA.Vehicle).neighborhoodRadius = 10;
    (this as YUKA.Vehicle).smoother = new YUKA.Smoother(30);
    (this as YUKA.Vehicle).boundingRadius =
      vehicleGeometry.boundingSphere.radius;
    (this as YUKA.Vehicle).setRenderComponent(vehicleMesh, this.sync);

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
    (this as YUKA.Vehicle).steering.add(obstacleAvoidanceBehavior);
  }

  sync(
    entity: { worldMatrix: any },
    renderComponent: { matrix: { copy: (arg0: any) => void } }
  ) {
    renderComponent.matrix.copy(entity.worldMatrix);
  }

  update(delta: Number): Vehicle {
    this.functionInUpdate();
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
      (this as YUKA.Vehicle).steering.remove(
        this.currentArriveBehavior.behavior
      );
    }
    this.currentArriveBehavior = {
      behavior: ArriveBehavior,
      target: pos,
    };
    (this as YUKA.Vehicle).steering.add(ArriveBehavior);
  }

  switchSeparateBehavior(mode: Boolean, weight?: Number) {
    if (mode) {
      if (
        this.currentSeparationBehavior &&
        this.currentSeparationBehavior.behavior
      ) {
        (this as YUKA.Vehicle).steering.remove(
          this.currentSeparationBehavior.behavior
        );
      }
      const separationBehavior = new YUKA.SeparationBehavior();
      separationBehavior.weight = weight || 20;
      this.currentSeparationBehavior = {
        behavior: separationBehavior,
        weight: weight || 20,
      };
      (this as YUKA.Vehicle).steering.add(separationBehavior);
    } else {
      if (
        !this.currentSeparationBehavior ||
        !this.currentSeparationBehavior.behavior
      ) {
        return;
      }
      (this as YUKA.Vehicle).steering.remove(
        this.currentSeparationBehavior.behavior
      );
    }
  }

  getInfo(): {} {
    const { x, y, z } = (this as YUKA.Vehicle).position;
    return {
      id: this.uuid,
      speed: (this as YUKA.Vehicle).getSpeed().toFixed(2),
      x: x.toFixed(2),
      y: y.toFixed(2),
      z: z.toFixed(2),
    };
  }

  enable() {
    (this as YUKA.Vehicle).active = true;
  }

  disable() {
    (this as YUKA.Vehicle).active = false;
  }

  sayConsole(something?: string, fullName?: boolean) {
    console.log(
      `${fullName ? this.uuid : this.uuid.substring(33, 36)}: ${
        something || "it's me"
      }`
    );
  }

  sendMessage(receiver: Vehicle, message: MessageType) {
    return super.sendMessage(receiver, "", messageDelay, message);
  }

  sendMessageOther(message: MessageType) {
    this.teamMembers.forEach((tm) => {
      const distanceBetween = (tm as YUKA.Vehicle)
        .getWorldPosition(new YUKA.Vector3(0, 0, 0))
        .distanceTo(
          (this as YUKA.Vehicle).getWorldPosition(new YUKA.Vector3(0, 0, 0))
        );
      if (distanceBetween < messageDistance) this.sendMessage(tm, message);
    });
  }

  handleMessage(message: YUKA.Telegram) {
    const msg: MessageType = message.data;
    if (this.messageStore.filter((m) => m.uuid === msg.uuid).length !== 0)
      return;
    this.messageStore.push(msg);
    // console.log(msg);
    switch (msg.type) {
      case MessageTypes.command:
        if (msg.sayOther) this.sendMessageOther(msg);
        switch ((msg as MessageCommand).command.action) {
          case commandActions.move:
            this.switchSeparateBehavior(true, 20);
            this.setTargetPosition(
              ((msg as MessageCommand).command as CommandMove).to
            );
            break;

          case commandActions.formCircle:
            this.switchSeparateBehavior(true, separationWeight);
            this.setTargetPosition(
              ((msg as MessageCommand).command as CommandMove).to
            );
            break;

          case commandActions.separationEnable:
            this.switchSeparateBehavior(true, separationWeight);
            break;

          case commandActions.separationDisable:
            this.switchSeparateBehavior(false);
            break;

          default:
            this.sayConsole("wrong command");
        }
        break;

      case MessageTypes.data:
        if (msg.sayOther) this.sendMessageOther(msg);
        break;

      default:
        this.sayConsole("wrong message format");
    }
    return true;
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
