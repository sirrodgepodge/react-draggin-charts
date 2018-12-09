import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { memoize } from "lodash";

import Hint from "react-vis/dist/plot/hint";
import HorizontalGridLines from "react-vis/dist/plot/horizontal-grid-lines";
import VerticalGridLines from "react-vis/dist/plot/vertical-grid-lines";
import { FlexibleXYPlot } from "react-vis/dist/make-vis-flexible";
import XAxis from "react-vis/dist/plot/axis/x-axis";
import YAxis from "react-vis/dist/plot/axis/y-axis";

import LineMarkSeries from "./libMod/LineMarkSeries";
import MarkSeries from "./libMod/MarkSeries";
import updateCoords from "./updateCoords";

import './style.css';

const defaultsObj = {
  pointStyle: {
    fill: "lightblue",
  },
  lineStyle: {
    stroke: "blue",
    fill: "transparent",
    strokeWidth: 3
  },
  margin: {
    top: 15,
    bottom: 15,
    right: 20,
    left: 20,
  }
};

export default class DragginChart extends PureComponent {
  static propTypes = {
    onPointDrag: PropTypes.func.isRequired,
    data: PropTypes.array,
    noDataText: PropTypes.string,
    pointSize: PropTypes.number,
    activePointSize: PropTypes.number,
    pointStyle: PropTypes.object,
    activePointStyle: PropTypes.object,
    lineStyle: PropTypes.object,
    margin: PropTypes.object,
    horizontalGridLines: PropTypes.bool,
    verticalGridLines: PropTypes.bool,
  };

  static defaultProps = {
    data: [],
    noDataText: "No Data",
    pointSize: 5,
    activePointSize: 7,
    horizontalGridLines: false,
    verticalGridLines: false,
    ...defaultsObj
  };

  constructor(props) {
    super(props);

    this.state = {
      activeIndex: null,
      isDragging: false
    };
    this.updateIndexCache();
    this.updateDomain();

    if (process.env.NODE_ENV !== 'production') {
      this.componentDidMount = () => {
        const { data = [] } = this.props;
        if (data) {
          const dataLength = data.length;
          const uniqueIdSize = new Set(data.map(({ id }) => id)).size;
          if (dataLength !== uniqueIdSize) {
            console.error('points given: ', this.props.data);
            throw new Error('must provide an array of objects with properties { x, y, id } must have a unique ID for each data point object');
          }
        }
      };
    }
  }

  __memoizedCache = {};
  memoizedGetMerged = (prop, obj) => {
    let func = this.__memoizedCache[prop];
    if (!func) {
      func = this.__memoizedCache = memoize(currentVal => ({
        ...defaultsObj[prop],
        ...currentVal || {},
      }));
    }
    return func(obj);
  }
  memoizedDoubleMerged = (key, obj, fallbacksObj) => {
    const cachedVal = this.__memoizedCache[key];
    if (!cachedVal) {
      const result = { ...fallbacksObj, ...obj };
      this.__memoizedCache[key] = {
        obj,
        fallbacksObj,
        result,
      };
      return result;
    }

    const {
      obj: prevObj,
      fallbacksObj: prevFallbacksObj,
      result: prevResult
    } = cachedVal;

    if (prevObj === obj && prevFallbacksObj === fallbacksObj) {
      return prevResult;
    }

    const result = { ...fallbacksObj, ...obj };
    cachedVal.obj = obj;
    cachedVal.fallbacksObj = fallbacksObj;
    cachedVal.result = result;

    return result;
  }

  prevData = this.props.data;
  updateDomain() {
    const { xDomain, yDomain, data } = this.props;
    this.xDomain = xDomain || getMinMaxOfProp("x", data);
    this.yDomain = yDomain || getMinMaxOfProp("y", data);
  }

  updateIndexCache() {
    const indexCache = new Map();
    const { data } = this.props;
    const dataLength = data.length;

    for (let i = 0; i < dataLength; i++) {
      indexCache.set(data[i], i);
    }
    this.indexCache = indexCache;
  }

  onValueDragStart = () => this.setState({ isDragging: true });
  onValueDragEnd = () => this.setState({ isDragging: false });
  onValueDrag = (oldVal, { chartCoords }) => {
    const { data, onPointDrag } = this.props;

    onPointDrag(
      updateCoords(
        data,
        { ...oldVal },
        {
          ...oldVal,
          ...chartCoords
        }
      )
    );
  };

  highlightPoint = pt =>
    !this.state.isDragging
    && this.setState({ activeIndex: this.indexCache.get(pt) });
  unhighlightPoints = () =>
    !this.state.isDragging
    && this.state.activeIndex !== null
    && this.setState({ activeIndex: null });

  render() {
    const {
      data,
      hoverComponent,
      noDataComponent,
      noDataText,
      formatX,
      formatY,
      lineStyle,
      pointSize,
      pointStyle,
      activePointSize,
      activePointStyle,
      margin,
      horizontalGridLines,
      verticalGridLines,
      ...otherProps
    } = this.props;

    if (this.data !== this.prevData) {
      this.updateIndexCache();
      this.updateDomain();
    }

    const { activeIndex, isDragging } = this.state;

    const {
      xDomain,
      yDomain,
      onValueDragStart,
      onValueDragEnd,
      onValueDrag,
      highlightPoint,
      unhighlightPoints
    } = this;

    const [minX, maxX] = xDomain;
    const [minY, maxY] = yDomain;

    const mergedLineStyle = this.memoizedGetMerged('lineStyle', lineStyle);
    const mergedPointStyle = this.memoizedDoubleMerged('mergedPointStyle',
      this.memoizedGetMerged('pointStyle', pointStyle),
      mergedLineStyle
    );
    const mergedActivePointStyle = this.memoizedDoubleMerged('mergedActivePointStyle',
      this.memoizedGetMerged('activePointStyle', activePointStyle),
      mergedPointStyle
    );

    const activeDataPoint = data[activeIndex] || null;

    // render path booleans
    const noData = data.length === 0;
    const noActiveDataPoint = activeDataPoint === null;

    return (
      <div className="__draggin-chart-container">
        <FlexibleXYPlot
          animation
          dontCheckIfEmpty
          onMouseLeave={unhighlightPoints}
          xDomain={xDomain}
          yDomain={yDomain}
          margin={this.memoizedGetMerged('margin', margin)}
          {...otherProps}
        >
          {verticalGridLines && <VerticalGridLines />}
          {horizontalGridLines && <HorizontalGridLines />}
          <XAxis tickFormat={formatX} on0 />
          <YAxis tickFormat={formatY} on0 />
          {noData ? null : (
            <LineMarkSeries
              data={data}
              onNearestXY={highlightPoint}
              size={pointSize}
              lineStyle={mergedLineStyle}
              markStyle={mergedPointStyle}
              animation={false}
            />
          )}
          {noData || noActiveDataPoint ? null : (
            <MarkSeries
              data={[activeDataPoint]}
              onValueDragStart={onValueDragStart}
              onValueDragEnd={onValueDragEnd}
              onValueDrag={onValueDrag}
              size={activePointSize}
              style={mergedActivePointStyle}
              animation={false}
            />
          )}
          {noActiveDataPoint
            ? null
            : hoverComponent && (
              <Hint value={activeDataPoint}>
                {hoverComponent({ isDragging, dataPoint: activeDataPoint })}
              </Hint>
            )}
          {!noData ? null : (
            <Hint
              value={{
                x: (minX + maxX) / 2,
                y: (minY + maxY) / 2
              }}
            >
              {(typeof noDataText != null || noDataComponent) && (
                <div className="no-data-description">
                  {noDataComponent ? (
                    noDataComponent()
                  ) : (
                    <h3 style={{ fontFamily: "sans-serif" }}>{noDataText}</h3>
                  )}
                </div>
              )}
            </Hint>
          )}
        </FlexibleXYPlot>
      </div>
    );
  }
}

export function getMinMaxOfProp(prop, arr) {
  let min = Infinity;
  let max = -Infinity;

  let currentArrVal;
  let currentArrPropVal;
  const arrLength = arr.length;
  for (let i = 0; i < arrLength; i++) {
    if (
      typeof (currentArrVal = arr[i]) === "object"
      && currentArrVal !== null
      && typeof (currentArrPropVal = currentArrVal[prop]) === "number"
      && !Number.isNaN(currentArrPropVal)
    ) {
      if (currentArrPropVal < min) min = currentArrPropVal;
      else if (currentArrPropVal > max) max = currentArrPropVal;
    }
  }

  return [min, max];
}
