// @ts-ignore
import * as YUKA from "yuka/build/yuka.module";
import React from "react";
import Vehicle from "../vehicle";

interface StatsTableProps {
  vehiclesArr: Vehicle[];
}

export default class StatsTable extends React.Component<StatsTableProps, {}> {
  state = {
    // @ts-ignore
    vArr: [],
  };

  componentDidMount() {
    setTimeout(() =>
      this.props.vehiclesArr.forEach((v, i) => {
        v.setFuncInUpdate(() => {
          const newVArr = this.state.vArr;
          newVArr[i] = v.getInfo();
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
          </div>
        ))}
      </div>
    );
  }
}
