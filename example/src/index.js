import React, { PureComponent } from "react";
import ReactDOM from "react-dom";
import DragginChart from "react-draggin-chart";
import PropTypes from 'prop-types';
import cx from "classnames";

import "./style.scss";
import "react-draggin-chart/style.css";

const NUMBER_OF_POINTS = 210; // increase for more points
const WAVINESS_FACTOR = 12.5; // increase for more curve

const MIN_X = -0.5;
const MAX_X = 0.5;
const MIN_Y = -1.1;
const MAX_Y = 1.1;
const JSON_CONTAINER_WIDTH = 275;

class App extends PureComponent {
  state = {
    coords: getWavyPointsArr(NUMBER_OF_POINTS, WAVINESS_FACTOR).map((y, i) => {
      const percentAroundZero = (i - NUMBER_OF_POINTS / 2) / NUMBER_OF_POINTS;
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
        <pre
          className="json-container"
          style={{
            width: JSON_CONTAINER_WIDTH
          }}
        >
          {JSON.stringify(coords, undefined, 2)}
        </pre>
        <div
          className="chart-container"
          style={{
            left: JSON_CONTAINER_WIDTH + 40,
            width: `calc(100% - ${JSON_CONTAINER_WIDTH + 65}px)`
          }}
        >
          <DragginChart
            onPointDrag={onPointDrag}
            data={coords}
            hoverComponent={HoverComponent}
            formatY={formatAsPercentage}
            xDomain={[MIN_X, MAX_X]}
            yDomain={[MIN_Y, MAX_Y]}
            activePointSize={9}
            pointSize={7}
            lineStyle={{
              strokeWidth: 3,
              stroke: "#8085d1"
            }}
            pointStyle={{
              strokeWidth: 4,
              stroke: "294a62",
              fill: "#dc66ad"
            }}
          />
        </div>
      </div>
    );
  }
}

function formatAsPercentage(v) {
  return `${Math.round(v * 100)}%`;
}

HoverComponent.propTypes = {
  isDragging: PropTypes.bool.isRequired,
  dataPoint: PropTypes.object.isRequired,
};

function HoverComponent({ isDragging, dataPoint: { id, x, y } }) {
  return (
    <div className={cx("point-description", { isDragging })}>
      <h4 className="point-description-header">
        {`ID: ${id}`}
      </h4>
      <span className="point-description-content">
        {`the X value for this point is ${Math.round(x * 10000) / 100}%`}
        <br />
        {`the Y value for this point is ${Math.round(y * 10000) / 100}%`}
      </span>
    </div>
  );
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

function getWavyPointsArr(numberOfPoints, wavynessMultiplier) {
  const arr = new Array(numberOfPoints);
  for (let i = 0; i < numberOfPoints; i++) {
    arr[i] = i % 2 === 0 ? 0 : -Math.sin(i * wavynessMultiplier / (numberOfPoints - 2));
  }
  return arr;
}
