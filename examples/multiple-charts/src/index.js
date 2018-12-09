import React, { PureComponent } from "react";
import ReactDOM from "react-dom";
import DragginChart from "react-draggin-charts";
import PropTypes from "prop-types";
import cx from "classnames";

import "./style.scss";
import "react-draggin-charts/dist/index.css";

const MIN_X = -0.5;
const MAX_X = 0.5;
const MIN_Y = -1.1;
const MAX_Y = 1.1;
const xDomain = [MIN_X, MAX_X];
const yDomain = [MIN_Y, MAX_Y];

const NUMBER_OF_POINTS = 105; // increase for more points
const WAVINESS_FACTOR = 12.5; // increase for more curve

const SCREEN_IS_SMALL = window.innerHeight < 600 && window.innerWidth < 900;
const activePointSize = SCREEN_IS_SMALL ? 4 : 6;
const pointSize = SCREEN_IS_SMALL ? 2.25 : 3.75;
const lineStyle = {
  strokeWidth: SCREEN_IS_SMALL ? 1 : 2.25,
  stroke: "#8085d1"
};
const pointStyle = {
  strokeWidth: SCREEN_IS_SMALL ? 1.25 : 2.5,
  stroke: "294a62",
  fill: "#dc66ad"
};

class App extends PureComponent {
  state = {
    coords1: getCoords("Series1", 1),
    coords2: getCoords("Series2", -1)
  };

  getOnPointDrag = prop => updatedCoords =>
    this.setState({
      [prop]: updatedCoords
    });
  onPointDrag1 = this.getOnPointDrag("coords1");
  onPointDrag2 = this.getOnPointDrag("coords2");

  render() {
    const { coords1, coords2 } = this.state;
    const { onPointDrag1, onPointDrag2 } = this;

    return (
      <div className="App">
        <div className="app-title-container">
          <h1 className="app-title">React Draggin Charts</h1>
        </div>
        <div className="all-charts-wrapper">
          <SingleDragginChart onPointDrag={onPointDrag1} coords={coords1} />
          <SingleDragginChart onPointDrag={onPointDrag2} coords={coords2} />
          <SingleDragginChart onPointDrag={onPointDrag2} coords={coords2} />
          <SingleDragginChart onPointDrag={onPointDrag1} coords={coords1} />
          <SingleDragginChart onPointDrag={onPointDrag1} coords={coords1} />
          <SingleDragginChart onPointDrag={onPointDrag2} coords={coords2} />
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(
  <>
    <link
      href="https://fonts.googleapis.com/css?family=Damion"
      rel="stylesheet"
    />
    <App />
  </>,
  rootElement
);

SingleDragginChart.propTypes = {
  onPointDrag: PropTypes.func.isRequired,
  coords: PropTypes.array.isRequired
};

function SingleDragginChart({ onPointDrag, coords }) {
  return (
    <div className="chart-container">
      <DragginChart
        onPointDrag={onPointDrag}
        data={coords}
        hoverComponent={HoverComponent}
        formatY={formatAsPercentage}
        xDomain={xDomain}
        yDomain={yDomain}
        activePointSize={activePointSize}
        pointSize={pointSize}
        lineStyle={lineStyle}
        pointStyle={pointStyle}
      />
    </div>
  );
}

function formatAsPercentage(v) {
  return `${Math.round(v * 100)}%`;
}

function getCoords(label, multiplyY = 1) {
  return getWavyPointsArr(NUMBER_OF_POINTS, WAVINESS_FACTOR).map((y, i) => {
    const adjNumberOfPoints = NUMBER_OF_POINTS - 1;
    const percentAroundZero = (i - adjNumberOfPoints / 2) / adjNumberOfPoints;
    return {
      x: percentAroundZero,
      y: multiplyY * y,
      id: `${label}: id-${i}`
    };
  });
}

function getWavyPointsArr(numberOfPoints, wavynessMultiplier) {
  const arr = new Array(numberOfPoints);
  for (let i = 0; i < numberOfPoints; i++) {
    arr[i] =
      i % 2 === 0
        ? 0
        : Math.sin(
          (i * wavynessMultiplier) /
              (numberOfPoints - (numberOfPoints % 2 === 0 ? 0 : 2))
        );
  }
  return arr;
}

HoverComponent.propTypes = {
  isDragging: PropTypes.bool.isRequired,
  dataPoint: PropTypes.object.isRequired
};

function HoverComponent({ isDragging, dataPoint: { id, x, y } }) {
  return (
    <div className={cx("point-description", { isDragging })}>
      <h4 className="point-description-header">{id}</h4>
      <span className="point-description-content">
        {`the X value for this point is ${Math.round(x * 10000) / 100}%`}
        <br />
        {`the Y value for this point is ${Math.round(y * 10000) / 100}%`}
      </span>
    </div>
  );
}
