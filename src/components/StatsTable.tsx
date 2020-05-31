// @ts-ignore
import * as YUKA from "yuka/build/yuka.module";
import React from "react";
import Vehicle from "../vehicle";
import { MessageCommand, MessageTypes } from "../vehicle/messagesTypes";
import { v4 } from "uuid";
import { commandActions } from "../vehicle/commandTypes";
import ControlFields from "./ControlFields";

interface StatsTableProps {
  vehiclesArr: Vehicle[];
  entityManager: YUKA.EntityManager;
}

export default class StatsTable extends React.Component<StatsTableProps, {}> {
  state = {
    // @ts-ignore
    vArr: [],
  };

  move = (to: Vehicle, x: number, z: number, sayOther: boolean) => {
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
    this.props.entityManager.entities[0].sendMessage(to, "", 0, data);
  };

  componentDidMount() {
    setTimeout(() =>
      this.props.vehiclesArr.forEach((v, i) => {
        v.setFuncInUpdate(() => {
          const newVArr = this.state.vArr;
          newVArr[i] = { ...v.getInfo(), vehicle: v };
          this.setState({
            vArr: newVArr,
          });
        });
      })
    );
  }

  render() {
    const align = "center";
    return (
      <table className={"stats-table"} cellSpacing={0}>
        <thead>
          <tr className={"stats-table-row"}>
            <td align={align}>Id</td>
            <td align={align}>x</td>
            <td align={align}>z</td>
            <td align={align}>Speed</td>
            <td align={align}>x</td>
            <td align={align}>z</td>
            <td align={align}>
              <div
                style={{
                  marginLeft: -15,
                  marginRight: -15,
                }}
              >
                say other
              </div>
            </td>
            <td />
            <td align={align}>separation</td>
            <td align={align}>stop</td>
            <td align={align}>form</td>
            <td align={align}>form</td>
          </tr>
        </thead>
        <tbody>
          {this.state.vArr.map((v) => (
            <tr key={v.id} className={"stats-table-row "}>
              <td align={align}>
                <div className={"stats-table__infoCell"}>
                  {v.id.substring(33, 36)}
                </div>{" "}
              </td>
              <td align={align}>
                <div className={"stats-table__infoCell"}>{v.x}</div>{" "}
              </td>
              <td align={align}>
                <div className={"stats-table__infoCell"}>{v.z}</div>{" "}
              </td>
              <td align={align}>
                <div className={"stats-table__infoCell"}>{v.speed}</div>{" "}
              </td>
              <ControlFields
                vehicle={v.vehicle}
                earth={this.props.entityManager.entities[0]}
              />
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}
