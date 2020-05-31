// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as YUKA from "yuka/build/yuka.module";
import * as THREE from "three/src/Three";
import "./styles/index.css";

import Vehicle from "./vehicle";
import indexReact from "./indexReact";
import { initRendering, startAnimate } from "./engineSetting";

export const entityManager = new YUKA.EntityManager();
export const time = new YUKA.Time();
export const vehiclesArr: Vehicle[] = [];

export const initDot = { x: 26, z: 70 };
export const distance = 13;
export const numberInRow = 5;
export const numberInColumn = 3;

function initObjects(scene: THREE.Scene) {
  const initPos: { x: number; z: number }[] = [];

  for (let i = 0; i < numberInRow; i++) {
    for (let j = 0; j < numberInColumn; j++) {
      initPos.push({
        x: initDot.x - i * distance,
        z: initDot.z - j * distance,
      });
    }
  }

  // game setup
  const creVec3 = (point: { x: number; z: number }) =>
    new YUKA.Vector3(point.x, 0, point.z);

  entityManager.add(new YUKA.Vehicle());

  initPos.forEach((pos) => {
    new Vehicle(scene, entityManager, vehiclesArr, creVec3(pos));
  });
}

indexReact(entityManager, vehiclesArr);
const fr = initRendering();
initObjects(fr.scene);
startAnimate(fr);
