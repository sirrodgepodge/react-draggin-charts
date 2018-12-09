import React from "react";
import { debounce } from "lodash";

import PropTypes from "prop-types";

import Animation from "react-vis/dist/animation";
import { ANIMATED_SERIES_PROPS } from "react-vis/dist/utils/series-utils";
import { warning } from "react-vis/dist/utils/react-utils";
import { DEFAULT_SIZE, DEFAULT_OPACITY } from "react-vis/dist/theme";

import AbstractSeries from "react-vis/dist/plot/series/abstract-series";

const predefinedClassName = "rv-xy-plot__series rv-xy-plot__series--mark";
const DEFAULT_STROKE_WIDTH = 1;
const eventObj = {
  capture: true,
  passive: true,
};

function getAdjToZeroVal(low) {
  let adjVal = 0;

  // if bottom of range is less than zero, need to add abs value to all
  if (low < 0) {
    adjVal = Math.abs(low);
  }

  return adjVal;
}

function toLowHigh([val1, val2]) {
  const low = Math.min(val1, val2);
  const high = low === val1 ? val2 : val1;
  return [low, high];
}

function toPercentage(value, [low, high]) {
  const adjToZeroVal = getAdjToZeroVal(low);

  value += adjToZeroVal;
  low += adjToZeroVal; // low will be zero if it was below zero
  high += adjToZeroVal;

  return value / (high - low);
}

function fromPercentage(percentage, [low, high]) {
  const adjToZeroVal = getAdjToZeroVal(low);
  return percentage * (high - Math.max(low, 0) + adjToZeroVal) + low; // don't question it...
}

function mapToDomain(value, domain, range) {
  const sortedDomain = toLowHigh(domain);
  const sortedRange = toLowHigh(range);
  const domainVal = fromPercentage(
    toPercentage(value, sortedRange),
    sortedDomain,
  );
  const [domainLowerBound, domainUpperBound] = sortedDomain;
  if (domainVal < domainLowerBound) {
    return domainLowerBound;
  }
  if (domainVal > domainUpperBound) {
    return domainUpperBound;
  }
  return domainVal;
}

export default class MarkSeries extends AbstractSeries {
  static displayName = "MarkSeries";

  static propTypes = {
    ...AbstractSeries.propTypes,
    getNull: PropTypes.func,
    strokeWidth: PropTypes.number,
  };

  static defaultProps = {
    getNull: () => true,
  };

  _valueMouseDownHandler = (d, event) => {
    this.dragIndex = this.indexCache[d.id];
    this._valueDragStartHandler(d, event, this.dragIndex);
    const { onValueMouseDown, onSeriesMouseDown } = this.props;
    if (onValueMouseDown) {
      onValueMouseDown(d, { event, index: this.dragIndex });
    }
    if (onSeriesMouseDown) {
      onSeriesMouseDown({ event });
    }
    if (super._valueMouseDownHandler) {
      super._valueMouseDownHandler(d, event);
    }
  };

  _valueMouseUpHandler = (d, event) => {
    const { onValueMouseUp, onSeriesMouseUp } = this.props;
    if (onValueMouseUp) {
      onValueMouseUp(d, { event, index: this.indexCache[d.id] });
    }
    if (onSeriesMouseUp) {
      onSeriesMouseUp({ event });
    }
    if (super._valueMouseUpHandler) {
      super._valueMouseUpHandler(d, event);
    }
  };

  _valueMouseMoveHandler = (d, event) => {
    const { onValueMouseMove, onSeriesMouseMove } = this.props;
    if (onValueMouseMove) {
      onValueMouseMove(d, { event, index: this.indexCache[d.id] });
    }
    if (onSeriesMouseMove) {
      onSeriesMouseMove({ event });
    }
    if (super._valueMouseMoveHandler) {
      super._valueMouseMoveHandler(d, event);
    }
  };

  _valueDragStartHandler = (d, event, index) => {
    const { onValueDragStart, onSeriesDragStart } = this.props;
    if (onValueDragStart) {
      onValueDragStart(d, { event, index });
    }
    if (onSeriesDragStart) {
      onSeriesDragStart({ event });
    }
    if (super._valueDragStartHandler) {
      super._valueDragStartHandler(d, event);
    }
  };

  _valueDragEndHandler = (d, event, index) => {
    const { onValueDragEnd, onSeriesDragEnd } = this.props;
    if (onValueDragEnd) {
      onValueDragEnd(d, { event, index });
    }
    if (onSeriesDragEnd) {
      onSeriesDragEnd({ event });
    }
    if (super._valueDragEndHandler) {
      super._valueDragEndHandler(d, event);
    }
  };

  _valueDragHandler = (d, event, index, chartCoords) => {
    const { onValueDrag, onSeriesDrag } = this.props;
    if (onValueDrag) {
      onValueDrag(d, { event, index, chartCoords });
    }
    if (onSeriesDrag) {
      onSeriesDrag({ event, chartCoords });
    }
    if (super._valueDragHandler) {
      super._valueDragHandler(d, event);
    }
  };

  componentDidMount() {
    document.addEventListener("mousemove", this.handleMouseMove, eventObj);
    document.addEventListener("mouseup", this.handleMouseUp, eventObj);
    window.addEventListener("resize", this.updateOffsetCoords, eventObj);
    window.addEventListener("scroll", this.updateOffsetCoords, eventObj);
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleMouseMove, eventObj);
    document.removeEventListener("mouseup", this.handleMouseUp, eventObj);
    window.removeEventListener("resize", this.updateOffsetCoords, eventObj);
    window.removeEventListener("scroll", this.updateOffsetCoords, eventObj);
  }

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      this.indexCache = this.createIndexCache();
    }
  }

  createIndexCache = () => {
    const { data } = this.props;
    const indexCache = {};
    const dataLength = data.length;

    for (let i = 0; i < dataLength; i++) {
      indexCache[data[i].id] = i;
    }

    return indexCache;
  };

  indexCache = this.createIndexCache();

  updateOffsetCoords = debounce(() => {
    if (this.svgElem) {
      const {
        top: svgElemOffsetTop,
        left: svgElemOffsetLeft,
      } = this.svgElem.getBoundingClientRect();
      this.svgElemOffsetTop = svgElemOffsetTop;
      this.svgElemOffsetLeft = svgElemOffsetLeft;
    }
  }, 16);

  refFunc = elem => {
    if (elem) {
      // we need container SVG for offsets
      while (elem.tagName.toUpperCase() !== "SVG") {
        elem = elem.parentNode;
      }
      this.svgElem = elem;
      this.updateOffsetCoords();
    }
  };

  dragIndex = -1; // null equivalent

  handleMouseUp = e => {
    if (this.dragIndex !== -1) {
      this._valueDragEndHandler(
        this.props.data[this.dragIndex],
        e,
        this.dragIndex,
      );
      this.dragIndex = -1;
    }
  };

  handleMouseMove = e => {
    if (this.dragIndex !== -1) {
      this._valueDragHandler(
        this.props.data[this.dragIndex],
        e,
        this.dragIndex,
        this.toChartCoords(e),
      );
    }
  };

  fromGlobalToChartCoords = e => {
    const { clientX, clientY } = e;
    const { svgElemOffsetTop, svgElemOffsetLeft } = this;
    const strokeWidthProp = this.props.style.strokeWidth;
    const strokeWidth = (
      typeof strokeWidthProp === "string" ? +strokeWidthProp.replace("px", "") : strokeWidthProp
    ) || 0;
    const size = this.props.size || 5;
    const radius = size + strokeWidth;
    return {
      x: clientX - svgElemOffsetLeft - this.props.marginLeft - radius,
      y: clientY - svgElemOffsetTop - this.props.marginTop, // - radius, screwed something up
    };
  };

  toChartCoords = e => {
    if (!this.svgElem) {
      return null;
    }
    const {
      xRange,
      yRange,
      xDomain,
      yDomain,
      innerHeight,
    } = this.props;

    const {
      x: adjX,
      y: adjY,
    } = this.fromGlobalToChartCoords(e);

    const yFromBottomOfChart = innerHeight - adjY;
    return {
      x: mapToDomain(adjX, xDomain, xRange),
      y: mapToDomain(yFromBottomOfChart, yDomain, yRange),
    };
  };

  _renderCircle(d, i, strokeWidth, style, scalingFunctions) {
    const {
      fill,
      opacity,
      size,
      stroke,
      x,
      y,
    } = scalingFunctions;

    const attrs = {
      r: size ? size(d) : DEFAULT_SIZE,
      cx: x(d),
      cy: y(d),
      style: {
        cursor: "pointer",
        opacity: opacity ? opacity(d) : DEFAULT_OPACITY,
        stroke: stroke && stroke(d),
        fill: fill && fill(d),
        strokeWidth: strokeWidth || DEFAULT_STROKE_WIDTH,
        ...style,
      },
      key: i,
      onClick: e => this._valueClickHandler(d, e),
      onMouseDown: e => this._valueMouseDownHandler(d, e),
      onMouseUp: e => this._valueMouseUpHandler(d, e),
      onMouseMove: e => this._valueMouseMoveHandler(d, e),
      onContextMenu: e => this._valueRightClickHandler(d, e),
      onMouseOver: e => this._valueMouseOverHandler(d, e),
      onMouseOut: e => this._valueMouseOutHandler(d, e),
    };
    return <circle {...attrs} />;
  }

  render() {
    const {
      animation,
      className,
      data,
      marginLeft,
      marginTop,
      strokeWidth,
      style,
    } = this.props;

    if (this.props.nullAccessor) {
      warning("nullAccessor has been renamed to getNull", true);
    }

    const getNull = this.props.nullAccessor || this.props.getNull;

    if (!data) {
      return null;
    }

    if (animation) {
      return (
        <Animation {...this.props} animatedProps={ANIMATED_SERIES_PROPS}>
          <MarkSeries {...this.props} animation={null} />
        </Animation>
      );
    }

    const scalingFunctions = {
      fill:
        this._getAttributeFunctor("fill") || this._getAttributeFunctor("color"),
      opacity: this._getAttributeFunctor("opacity"),
      size: this._getAttributeFunctor("size"),
      stroke:
        this._getAttributeFunctor("stroke")
        || this._getAttributeFunctor("color"),
      x: this._getAttributeFunctor("x"),
      y: this._getAttributeFunctor("y"),
    };

    return (
      <g
        className={`${predefinedClassName} ${className}`}
        transform={`translate(${marginLeft},${marginTop})`}
        ref={this.refFunc}
      >
        {data.map(
          (d, i) => getNull(d) && this._renderCircle(d, i, strokeWidth, style, scalingFunctions)
        )}
      </g>
    );
  }
}
