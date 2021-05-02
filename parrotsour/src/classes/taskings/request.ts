export class Airspace {
  // temporary. TODO -- flush out how airspaces work
}

//temporary
// TODO -- figure out how AS requests should behave
export class AirspaceRequest {
    location: string|undefined 
    alt: number|undefined = 0

    goodLoc = false
    goodAlt = false
}