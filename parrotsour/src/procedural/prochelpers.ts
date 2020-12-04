import { Group } from "utils/interfaces";

export function getAsset(groups: Group[], callsign:string){
    return groups.find(a => {
        if (a.callsign) { 
            return a.callsign.toUpperCase() === callsign.toUpperCase()
        } else {
            return false
        }
    });
}

export function setDesiredFL(asset:Group, fl:string){
    var fl2Dig = fl.substring(0,2);
    if (asset.z[0].toString() !== fl){
        asset.desiredAlt = parseInt(fl2Dig);
    }
}

