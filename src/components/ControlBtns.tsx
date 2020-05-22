// @ts-ignore
import * as YUKA from "yuka/build/yuka.module";
import React from "react";
import { MessageCommand, MessageTypes } from "../vehicle/messagesTypes";
import { commandActions } from "../vehicle/commandTypes";
import { v4 } from "uuid";
import Vehicle from "../vehicle";

interface ControlBtnsProps {
  entityManager: YUKA.EntityManager,
  vehiclesArr: Vehicle[],
}

export default class ControlBtns extends React.Component<ControlBtnsProps, {}> {
  start = () => {
    const tp = { x: -8, z: -8 };
    this.props.vehiclesArr.forEach((v) => v.setTargetPosition(tp));
  }

  // label = () => {
  //   this.props.vehiclesArr.forEach((v) => v.updateLabel());
  // }

  active = () => {
    this.props.vehiclesArr.forEach((v) => {
      v.enable();
    });
  }

  stop = () => {
    this.props.vehiclesArr.forEach((v) => {
      v.disable();
    });
  }

  move_SO = (x: number, z: number) => {
    const data: MessageCommand = {
      uuid: v4(),
      type: MessageTypes.command,
      fromWho: "from earth",
      sayOther: true,
      command: {
        action: commandActions.move,
        to: { x, z },
      },
    };
    return () => this.props.entityManager.entities[0].sendMessage(this.props.vehiclesArr[3], "", 0, data);
  }

  sepEn = () => {
    const data: MessageCommand = {
      uuid: v4(),
      type: MessageTypes.command,
      fromWho: "from earth",
      sayOther: true,
      command: {
        action: commandActions.separationEnable,
      },
    };
    this.props.entityManager.entities[0].sendMessage(this.props.vehiclesArr[3], "", 0, data);
  }

  sepDis = () => {
    const data: MessageCommand = {
      uuid: v4(),
      type: MessageTypes.command,
      fromWho: "from earth",
      sayOther: true,
      command: {
        action: commandActions.separationDisable,
      },
    };
    this.props.entityManager.entities[0].sendMessage(this.props.vehiclesArr[3], "", 0, data);
  }

  render() {
    const btns = [
      // { name: 'label', cb: this.label },
      { name: "active", cb: this.active },
      { name: "stop", cb: this.stop },
      { name: "sep enb", cb: this.sepEn },
      { name: "sep dis", cb: this.sepDis },
      { name: "move -60 -60", cb: this.move_SO(-60, -60) },
      { name: "move -60 60", cb: this.move_SO(-60, 60) },
      { name: "move 60 -60", cb: this.move_SO(60, -60) },
      { name: "move 60 60", cb: this.move_SO(60, 60) },
    ];

    return (
      <div className={"controlBtns"}>
        <div>
          {btns.map((btn, i) => (
            <button
              key={`btn-${i}-${btn.name}`}
              id={"start-btn"}
              className={"controlBtn"}
              onClick={btn.cb}
            >
              {btn.name}
            </button>
          ))}
        </div>
      </div>
    );
  }
}
