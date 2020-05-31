// @ts-ignore
import * as YUKA from "yuka/build/yuka.module";
import React from "react";
import { MessageCommand, MessageTypes } from "../vehicle/messagesTypes";
import { commandActions } from "../vehicle/commandTypes";
import { v4 } from "uuid";
import Vehicle from "../vehicle";

interface ControlBtnsProps {
  entityManager: YUKA.EntityManager;
  vehiclesArr: Vehicle[];
}

export default class ControlBtns extends React.Component<ControlBtnsProps, {}> {
  start = () => {
    const tp = { x: -8, z: -8 };
    this.props.vehiclesArr.forEach((v) => v.setTargetPosition(tp));
  };

  // label = () => {
  //   this.props.vehiclesArr.forEach((v) => v.updateLabel());
  // }

  active = () => {
    this.props.vehiclesArr.forEach((v) => {
      v.enable();
    });
  };

  stop = () => {
    this.props.vehiclesArr.forEach((v) => {
      v.disable();
    });
  };

  render() {
    const btns = [
      // { name: 'label', cb: this.label },
      { name: "active", cb: this.active },
      { name: "stop", cb: this.stop },
    ];

    return (
      <div className={"controlBtns"}>
        <div>
          {btns.map((btn, i) => (
            <button
              key={`btn-${i}-${btn.name}`}
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
