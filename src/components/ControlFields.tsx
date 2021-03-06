// @ts-ignore
import * as YUKA from "yuka/build/yuka.module";
import React from "react";
import Vehicle from "../vehicle";
import { MessageCommand, MessageTypes } from "../vehicle/messagesTypes";
import { v4 } from "uuid";
import { commandActions } from "../vehicle/commandTypes";

interface ControlFieldsProps {
  vehicle: Vehicle;
  earth: YUKA.Entity;
}

interface ControlFieldsState {
  x: number;
  z: number;
  sayOther: boolean;

  separation: boolean;
  enabled: boolean;
}

export default class ControlFields extends React.Component<
  ControlFieldsProps,
  ControlFieldsState
> {
  state = {
    x: 0,
    z: 0,
    sayOther: false,

    separation: false,
    enabled: true,
  };

  move = () => {
    this.setState({
      separation: false,
      enabled: true,
    });
    const { x, z, sayOther } = this.state;
    const data: MessageCommand = {
      uuid: v4(),
      type: MessageTypes.command,
      fromWho: "from earth",
      sayOther,
      command: {
        action: commandActions.move,
        to: { x, z },
      },
    };
    this.props.earth.sendMessage(this.props.vehicle, "", 0, data);
  };

  enable = () => {
    if (this.state.enabled) {
      this.props.vehicle.disable();
      this.setState({ enabled: false });
    } else {
      this.props.vehicle.enable();
      this.setState({ enabled: true });
    }
  };

  separate = () => {
    let action:
      | commandActions.separationEnable
      | commandActions.separationDisable;
    if (this.state.separation) {
      action = commandActions.separationDisable;
      this.setState({ separation: false });
    } else {
      action = commandActions.separationEnable;
      this.setState({ separation: true });
    }
    const data: MessageCommand = {
      uuid: v4(),
      type: MessageTypes.command,
      fromWho: "from earth",
      command: {
        action,
      },
    };
    this.props.earth.sendMessage(this.props.vehicle, "", 0, data);
  };

  buildSquire = () => {
    const data: MessageCommand = {
      uuid: v4(),
      type: MessageTypes.command,
      fromWho: "from earth",
      command: {
        action: commandActions.formSquire,
        to: new YUKA.Vector3(this.state.x, 0, this.state.z),
      },
    };
    this.props.earth.sendMessage(this.props.vehicle, "", 0, data);
  };

  buildCircle = () => {
    const data: MessageCommand = {
      uuid: v4(),
      type: MessageTypes.command,
      fromWho: "from earth",
      command: {
        action: commandActions.formCircle,
        to: new YUKA.Vector3(this.state.x, 0, this.state.z),
      },
    };
    this.props.earth.sendMessage(this.props.vehicle, "", 0, data);
  };

  render() {
    const align = "center";
    return (
      <>
        <td align={align}>
          <input
            className={"controlFields__input"}
            type="text"
            placeholder={"x"}
            // value={this.state.x}
            onChange={(e) => {
              const { value } = e.target;
              if (!isNaN(+value)) this.setState({ x: +value });
            }}
          />
        </td>
        <td align={align}>
          <input
            className={"controlFields__input"}
            type="text"
            placeholder={"z"}
            // value={this.state.z}
            onChange={(e) => {
              const { value } = e.target;
              if (!isNaN(+value)) this.setState({ z: +value });
            }}
          />
        </td>
        <td align={align}>
          <input
            className={"controlFields__checkbox"}
            type="checkbox"
            checked={this.state.sayOther}
            onChange={(e) => {
              const { value } = e.target;
              if (value === "on")
                this.setState((prevSt) => ({ sayOther: !prevSt.sayOther }));
            }}
          />
        </td>
        <td align={align}>
          <button
            className={"controlFields__button"}
            title={`move to ${this.state.x} ${this.state.z}, ${
              this.state.sayOther
                ? "say other command"
                : "dont say other command"
            }`}
            onClick={this.move}
          >
            move
          </button>
        </td>
        <td align={align}>
          <button
            className="controlFields__button"
            title={`${!this.state.separation ? "enable" : "disable"} separation`}
            onClick={this.separate}>
            {!this.state.separation ? "enb" : "dis"}
          </button>
        </td>
        <td align={align}>
          <button
            className="controlFields__button"
            title={`${!this.state.enabled ? "enable" : "disable"} vehicle`}
            onClick={this.enable}>
            {!this.state.enabled ? "enb" : "dis"}
          </button>
        </td>
        <td align={align}>
          <button
            className="controlFields__button"
            title={`squire to ${this.state.x} ${this.state.z}`}
            onClick={this.buildSquire}
          >
            squire
          </button>
        </td>
        <td align={align}>
          <button
            className="controlFields__button"
            title={`circle to ${this.state.x} ${this.state.z}`}
            onClick={this.buildCircle}
          >
            circle
          </button>
        </td>
      </>
    );
  }
}
