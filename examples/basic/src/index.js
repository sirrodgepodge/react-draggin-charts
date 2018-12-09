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

const NUMBER_OF_POINTS = 209; // increase for more points
const WAVINESS_FACTOR = 12.5; // increase for more curve

const SCREEN_IS_SMALL = window.innerHeight < 600 && window.innerWidth < 900;
const activePointSize = SCREEN_IS_SMALL ? 6.5 : 9;
const pointSize = SCREEN_IS_SMALL ? 4.5 : 7;
const lineStyle = {
  strokeWidth: SCREEN_IS_SMALL ? 1.5 : 3.25,
  stroke: "#8085d1"
};
const pointStyle = {
  strokeWidth: SCREEN_IS_SMALL ? 2.5 : 4,
  stroke: "294a62",
  fill: "#dc66ad"
};

class App extends PureComponent {
  state = {
    coords: getWavyPointsArr(NUMBER_OF_POINTS, WAVINESS_FACTOR).map((y, i) => {
      const adjNumberOfPoints = NUMBER_OF_POINTS - 1;
      const percentAroundZero = (i - adjNumberOfPoints / 2) / adjNumberOfPoints;
      return {
        x: percentAroundZero,
        y,
        id: `id-${i}`
      };
    })
  };

  onPointDrag = updatedCoords =>
    this.setState({
      coords: updatedCoords
    });

  render() {
    const { coords } = this.state;
    const { onPointDrag } = this;

    return (
      <div className="App">
        <div className="app-title-container">
          <h1 className="app-title">React Draggin Charts</h1>
        </div>
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
        <pre className="json-container">
          {JSON.stringify(coords, undefined, 2)}
        </pre>
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

function formatAsPercentage(v) {
  return `${Math.round(v * 100)}%`;
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
      <h4 className="point-description-header">{`ID: ${id}`}</h4>
      <span className="point-description-content">
        {`the X value for this point is ${Math.round(x * 10000) / 100}%`}
        <br />
        {`the Y value for this point is ${Math.round(y * 10000) / 100}%`}
      </span>
    </div>
  );
}
