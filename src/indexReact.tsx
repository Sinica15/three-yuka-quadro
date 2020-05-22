// @ts-ignore
import * as YUKA from "yuka/build/yuka.module";
import React from "react";
import ReactDom from "react-dom";
import Vehicle from "./vehicle";
import ControlBtns from "./components/ControlBtns";
import StatsTable from "./components/StatsTable";

export default function (
  entityManager: YUKA.EntityManager,
  vehiclesArr: Vehicle[]
) {
  const app = document.createElement("div");
  app.id = "app";
  document.body.appendChild(app);

  ReactDom.render(
    <div className={"app"}>
      <div className={"buttons-mount"}>
        <ControlBtns entityManager={entityManager} vehiclesArr={vehiclesArr} />
        <div id={"three-mount"} />
      </div>
      <StatsTable vehiclesArr={vehiclesArr} />
    </div>,
    document.getElementById("app")
  );
}
