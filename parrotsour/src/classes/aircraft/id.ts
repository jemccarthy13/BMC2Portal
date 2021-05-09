export enum IDMatrix {
  HOSTILE = "red",
  SUSPECT = "orange",
  ASSUME_FRIEND = "green",
  NEUTRAL = "purple",
  FRIEND = "blue",
}

export function getMostRestrictiveID(ids: IDMatrix[]): IDMatrix {
  function idToNum(id: IDMatrix) {
    const num = 4
    switch (id) {
      case IDMatrix.SUSPECT:
        return 3
      case IDMatrix.NEUTRAL:
        return 2
      case IDMatrix.ASSUME_FRIEND:
        return 1
      case IDMatrix.FRIEND:
        return 1
    }
    return num
  }
  let lowestID = IDMatrix.HOSTILE
  let lowestIDNum = 4
  for (let i = 0; i < ids.length; i++) {
    const idNum = idToNum(ids[i])
    if (idNum < lowestIDNum) {
      lowestIDNum = idNum
      lowestID = ids[i]
    }
  }
  return lowestID
}
