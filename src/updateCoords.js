import { cloneDeep } from "lodash";

export default function updateCoords(inputPointsArr, currentVal, newVal) {
  const outputPointsArr = cloneDeep(inputPointsArr);
  if (newVal.applyConditionals) {
    newVal = newVal.applyConditionals(currentVal, newVal, outputPointsArr);
  }

  // lock handling
  if (newVal.lockX) {
    newVal.x = currentVal.x;
  }
  if (newVal.lockY) {
    newVal.y = currentVal.y;
  }

  // min handling
  if (newVal.minX != null && newVal.x < newVal.minX) {
    newVal.x = newVal.minX;
  }
  if (newVal.minY != null && newVal.y < newVal.minY) {
    newVal.y = newVal.minY;
  }

  const { xTiedTo, yTiedTo } = newVal;

  const cache = {};

  if (xTiedTo) {
    const idIndex = getIdIndex(xTiedTo, outputPointsArr, cache);
    if (idIndex !== -1) {
      const tiedIdObj = outputPointsArr[idIndex];
      if (tiedIdObj.minX != null && newVal.x < tiedIdObj.minX) {
        newVal.x = tiedIdObj.minX;
      }
      tiedIdObj.x = newVal.x;
    }
  }
  if (yTiedTo) {
    const idIndex = getIdIndex(yTiedTo, outputPointsArr, cache);
    if (idIndex !== -1) {
      const tiedIdObj = outputPointsArr[idIndex];
      if (tiedIdObj.minY != null && newVal.y < tiedIdObj.minY) {
        newVal.y = tiedIdObj.minY;
      }
      tiedIdObj.y = newVal.y;
    }
  }
  outputPointsArr[getIdIndex(newVal.id, outputPointsArr, cache)] = newVal;
  return outputPointsArr;
}

// maybe too complicated
function getIdIndex(id, arr, indexCache = {}) {
  const cacheIndex = indexCache[id];
  if (cacheIndex != null) {
    return cacheIndex;
  }

  let idFound = false;
  let index = indexCache.latestIndex || 0;
  const arrLength = arr.length;
  while (!idFound && index < arrLength) {
    const idAtIndex = arr[index].id;
    indexCache[idAtIndex] = index;
    if (arr[index].id === id) {
      idFound = true;
      indexCache.latestIndex++;
    } else {
      indexCache.latestIndex = ++index;
    }
  }

  if (!idFound) {
    return -1;
  }

  return index;
}
