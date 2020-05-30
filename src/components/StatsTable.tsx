// @ts-ignore
import * as YUKA from "yuka/build/yuka.module";
import React from "react";
import Vehicle from "../vehicle";
import { MessageCommand, MessageTypes } from "../vehicle/messagesTypes";
import { v4 } from "uuid";
import { commandActions } from "../vehicle/commandTypes";
import ControlFields from "./controlFields";

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
    return (
      <div className={"stats-table"}>
        <div className={"stats-table-row"}>
          <div>Id</div>
          <div>x</div>
          <div>y</div>
          <div>Speed</div>
        </div>
        {this.state.vArr.map((v) => (
          <div key={v.id} className={"stats-table-row "}>
            <div>{v.id.substring(33, 36)}</div>
            <div>{v.x}</div>
            <div>{v.z}</div>
            <div>{v.speed}</div>
            <ControlFields
              vehicle={v.vehicle}
              earth={this.props.entityManager.entities[0]}
            />
          </div>
        ))}
      </div>
    );
  }
}
