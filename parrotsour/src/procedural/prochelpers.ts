import { DrawAnswer, Group } from "utils/interfaces";

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

export function aiProcess(msg:string, answer: DrawAnswer){
    // do some things to NLP the message
    console.log(answer.groups)
    console.log(msg)

    if (msg.indexOf("proceed") > -1){
        console.log(answer)
        answer.groups[0].desiredHeading=90
        console.log("interpreted")
    }
}