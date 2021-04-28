import { DrawAnswer, Group } from "utils/interfaces";

export function getAsset(groups: Group[], callsign:string):Group|undefined{
    return groups.find(a => {
        if (a.callsign) { 
            return a.callsign.toUpperCase() === callsign.toUpperCase()
        } else {
            return false
        }
    });
}

export function setDesiredFL(asset:Group, fl:string):void{
    const fl2Dig = fl.substring(0,2);
    if (asset.z[0].toString() !== fl){
        asset.desiredAlt = parseInt(fl2Dig);
    }
}

function convertToXY(cgrs:string){
    const re = new RegExp("([0-9]+)([A-Z])([A-Z])([0-9]*).*");
    const match = cgrs.match(re);
    let x = 50;
    let y = 50;
    if (match){
        const row = match[1];
        const col2 = (match[3].charCodeAt(0));
        let keypad = match[4];
        if (keypad==="") keypad = "5"
        const kp = parseInt(keypad)
        let xMod = (kp%3)
        if (xMod ===0) xMod = 3;
        const xOff = (xMod-1)* 33 + 15;
        let yOff = 81;
        if (kp < 4 ){
            yOff = 15;
        } else if (kp < 7){
            yOff = 48;
        }
        y = ((localStorage.startRow - parseInt(row)) * 100) + yOff;
        x = ((col2 - localStorage.startCol2) * 100) + xOff;
    }
    return {x: x, y:y};
}

function convertToCGRS(x:number, y:number){
    const keypads = [[1,2,3],[4,5,6],[7,8,9]];
    const row = (localStorage.startRow - Math.floor(y/100));
    const col = String.fromCharCode(localStorage.startCol1) + String.fromCharCode(localStorage.startCol2 + Math.floor(x/100));
    const keypad = keypads[Math.floor((y%100)/33)][Math.floor((x%100)/33)];
    return row + col + keypad +"+";
}

// eslint-disable-next-line
export function aiProcess(nlp:any, msgText:string, answer: DrawAnswer, sendResponse:(sender:string, msg:string)=>void):void{
    // do some things to NLP the message
    console.log(answer.groups)
    console.log(msgText)

    msgText = msgText.toUpperCase();
    const re = new RegExp("([0-9]+[A-Z]+[0-9]*)");
    const matches = msgText.match(re);
    let cgrs = "";
    if (matches){
        console.log("loop replace cgrs");
        matches.forEach((elem) => {
            const xy = convertToXY(elem);
            msgText = msgText.replace(elem, xy.x + " " + xy.y);
            cgrs = elem;
        });
    }    
    msgText=msgText.toLowerCase();

    msgText = msgText.replaceAll("/", "")
    const nl = nlp(msgText);

    const assetMsg = nl.match("[<cs>#Noun] *");
    const cmd = nl.match("[<cs>#Noun] [<act>#Verb] #Unit [<fl>#Cardinal]");
    const move = nl.match("[<cs>#Noun] [<cmd>#Verb?] * [<x>#Cardinal] [<y>#Cardinal]");
    const move3d = nl.match("[<cs>#Noun] [#Verb?] * [<x>#Cardinal] [<y>#Cardinal] app? [#Verb?] [#Preposition?] #Unit [<fl>#Cardinal]")
    const desert3d = nl.match("[<cs>#Noun] [#Verb?] * [<x>#Cardinal] [<y>#Cardinal] * app? * [#Verb?] [#Preposition?] #Unit [<fl>#Cardinal]")
    const desert3d2 = nl.match("[<cs>#Noun] [#Verb?] * [<x>#Cardinal] [<y>#Cardinal] * [#Verb?] [#Preposition?] #Unit [<fl>#Cardinal] * app?")
    const question = nl.match('[<cs>#Noun] * [<thing>#Noun] *');

    const cs = assetMsg.groups().cs
    const callsign = cs ? cs.text().toUpperCase() : "SYSTEM"
    const asset = getAsset(answer.groups, callsign);

    console.log(nl)

    const isCommand = cmd.found;
    const isMove = move.found;
    const isMove3d = move3d.found || desert3d.found || desert3d2.found;
    const isQuestion = nl.sentences().isQuestion().length > 0;

    if (isMove){
        if (asset){       
            const command = move.groups().cmd
            const cmdText = command ? command.text() : undefined;
            if (!cmdText || (cmdText ==="transit" || cmdText ==="proceed" || cmdText==="move")){
                const locX = move.groups().x.text();
                const locY = move.groups().y.text();
                let fl
                if (isMove3d){
                    fl = move3d.groups().fl.text();
                    console.log(fl)
                    setDesiredFL(asset,fl);
                }

                sendResponse(callsign, "c, " + (command ? command.verbs().toGerund().text() : "moving") + " to " + ((cgrs!=="") ? cgrs:
                (locX +"," + locY)) + 
                (isMove3d ? (" at FL " + fl) : ""));

                asset.desiredLoc = [{x:locX, y:locY}];
                asset.isCapping = false;
            } else {
                sendResponse(callsign, "I don't understand " + cmd.text());
            }   
            
        } else {
            sendResponse("SYSTEM", "Asset unknown.");
        }
    }
    else if (isCommand){
        if (asset){
            const newfl = cmd.groups().fl.text();
            sendResponse(callsign, "c, " + cmd.groups().act.verbs().toGerund().text() + " " + newfl)
            console.log("UPDATE TRACK");
            // console.log(asset);
            setDesiredFL(asset,newfl);
        } else {
            sendResponse("SYSTEM", "Asset unknown.");
        }
    } else if (isQuestion){
        const thing = question.groups().thing.text();
        
        if (!asset){
            sendResponse("SYSTEM", "Asset unknown.");
        } else if ((thing ==="status" || thing==="location" || thing ==="posit" || thing ==="cwas")){
            if (asset.isCapping){
                sendResponse(callsign, "working " + convertToCGRS(asset.startX, asset.startY));
            } else if (asset.desiredLoc) {
                const current = convertToCGRS(asset.startX, asset.startY).replace("+", "");
                const desired = convertToCGRS(asset.desiredLoc[0].x, asset.desiredLoc[0].y);
                sendResponse(callsign, "passing " + current + ", enroute to " + desired);
            } else {
                sendResponse(callsign, "stby")
            }
        } else if (thing ==="tasking" ){
            if (asset.tasking){
                console.log("TODO -- read back tasking when assigned")
            } else {
                if (asset.type==="rpa"){
                    sendResponse(callsign,"performing ISR iwas");
                } else {
                    sendResponse(callsign, "no tasking att, XCAS ufn");
                }
            }
        } else if (thing.toLowerCase() ==="eta"){
            if (asset.isCapping){
                sendResponse(callsign, "I'm already on loc");
            } else{
                sendResponse(callsign, "ETA 5m");
            }
        } else {
            sendResponse(callsign, "I don't understand the question");
        }
    } else{
        sendResponse(callsign, "I don't understand.")
    }
    
    // if (!continueAnimation){
    //     snackbar("You need to start the sim (Fights On)", undefined, "#FA5D5D");
    // }
}