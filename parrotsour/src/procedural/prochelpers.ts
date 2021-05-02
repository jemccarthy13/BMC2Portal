import { ACType } from "classes/groups/aircraft";
import { PictureAnswer } from "canvas/canvastypes";
import { AircraftGroup } from "classes/groups/group";
import { Point } from "classes/point";

export function getAsset(groups: AircraftGroup[], callsign:string):AircraftGroup|undefined{
    return groups.find(a => {
        if (a.getLabel()) { 
            return a.getLabel().toUpperCase() === callsign.toUpperCase()
        } else {
            return false
        }
    });
}

export function convertToXY(cgrs:string|undefined): Point{
    if (cgrs === undefined){
        return new Point(50,50)
    }
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

        /// TODO - fix logic here to translate to x,y coordinates
        //log(kp, yOff)
        //log(row, localStorage.startRow)
        y = ((localStorage.startRow - parseInt(row)) * 100) + yOff;
        x = ((col2 - localStorage.startCol2) * 100) + xOff;
    }
    return new Point(x,y)
}

export function convertToCGRS(x:number, y:number): string{
    const keypads = [[1,2,3],[4,5,6],[7,8,9]];
    const row = (localStorage.startRow - Math.floor(y/100));
    const col = String.fromCharCode(localStorage.startCol1) + String.fromCharCode(localStorage.startCol2 + Math.floor(x/100));
    const keypad = keypads[Math.floor((y%100)/33)][Math.floor((x%100)/33)];
    return row + col + keypad +"+";
}

// eslint-disable-next-line
export function aiProcess(nlp:any, msg:{text:string, voice:boolean}, answer: PictureAnswer, sendResponse:(sender:string, msg:string, voice?:boolean)=>void):void{
    // do some things to NLP the message

    let msgText = msg.text

    msgText = msgText.toUpperCase();
    const re = new RegExp("([0-9]+[A-Z]+[0-9]*)");
    const matches = msgText.match(re);
    let cgrs = "";
    if (matches){
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
    const radiocheck = nl.match("[<cs>#Noun]");
    const cmd = nl.match("[<cs>#Noun] [<act>#Verb] #Unit [<fl>#Cardinal]");
    const move = nl.match("[<cs>#Noun] [<cmd>#Verb?] * [<x>#Cardinal] [<y>#Cardinal]");
    const move3d = nl.match("[<cs>#Noun] [#Verb?] * [<x>#Cardinal] [<y>#Cardinal] app? [#Verb?] [#Preposition?] #Unit [<fl>#Cardinal]")
    const desert3d = nl.match("[<cs>#Noun] [#Verb?] * [<x>#Cardinal] [<y>#Cardinal] * app? * [#Verb?] [#Preposition?] #Unit [<fl>#Cardinal]")
    const desert3d2 = nl.match("[<cs>#Noun] [#Verb?] * [<x>#Cardinal] [<y>#Cardinal] * [#Verb?] [#Preposition?] #Unit [<fl>#Cardinal] * app?")
    const question = nl.match('[<cs>#Noun] * [<thing>#Noun] *');
    const question2 = nl.match('[<cs>#Noun] interrogative [<thing>#Noun] *');

    const cs = assetMsg.groups().cs
    const callsign = cs ? cs.text().toUpperCase() : "SYSTEM"
    const asset = getAsset(answer.groups, callsign);

    const isCommand = cmd.found;
    const isMove = move.found;
    const isMove3d = move3d.found || desert3d.found || desert3d2.found;
    const isQuestion = nl.sentences().isQuestion().length > 0;
    const interrogative = question2.found
    const isRadCheck = radiocheck.found
    
    function convertToJargon(msg:string):string{
        const m = new Map()
        m.set("A", "alpha")
        m.set("B", "bravo")
        m.set("C", "charlie")
        m.set("D", "delta")
        m.set("E", "echo")
        m.set("F", "fox")
        m.set("G", "gulf")
        m.set("H", "hotel")
        m.set("I", "india")
        m.set("J", "juliet")
        m.set("K", "kilo")
        m.set("L", "lima")
        m.set("M", "mike")
        m.set("N", "november")
        m.set("O", "oscar")
        m.set("P", "pa pa")
        m.set("Q", "quebec")
        m.set("R", "romeo")
        m.set("S", "sierra")
        m.set("T", "tango")
        m.set("U", "uniform")
        m.set("V", "victor")
        m.set("W", "whiskey")
        m.set("X", "x-ray")
        m.set("Y", "yankee")
        m.set("Z", "zulu")
        return [...msg.toUpperCase()].map(x => m.get(x) ? m.get(x) : x).join(' ')
    }

    if (!asset){
        sendResponse("SYSTEM", "No such callsign.")
        return
    }

    if (isMove){      
        const command = move.groups().cmd
        const cmdText = command ? command.text() : undefined;
        if (!cmdText || (cmdText ==="transit" || cmdText ==="proceed" || cmdText==="move")){
            const locX = move.groups().x.text();
            const locY = move.groups().y.text();
            let fl
            if (isMove3d){
                fl = move3d.groups().fl.text();
                asset.updateIntent({
                    desiredAlt: fl
                })
            }

            let cpy = "c"
            let FL = "FL"

            
            if (msg.voice){
                cpy = "copy"
                FL = "flight level"
                fl = fl?.split('').join(' ')
                cgrs = convertToJargon(cgrs)
            }
            sendResponse(callsign, cpy+", " + (command ? command.verbs().toGerund().text() : "moving") + " to " + ((cgrs!=="") ? cgrs:
            (locX +"," + locY)) + 
            (isMove3d ? (" at "+ FL + " " + fl) : ""), msg.voice);

            asset.addRoutingPoint(new Point(locX, locY))
            // asset.setCapping(false)
        } else {
            sendResponse(callsign, "I don't understand " + cmd.text(), msg.voice);
        }
    }
    else if (isCommand){
        const newflActual = cmd.groups().fl.text();
        let newfl = newflActual
        let cpy = "c, "
        if (msg.voice){
            cpy = "copy, "
            newfl = newflActual.replace("FL", " flight level ")
            newfl = newflActual?.split('').join(' ')
        }
        sendResponse(callsign, cpy + cmd.groups().act.verbs().toGerund().text() + " " + newfl, msg.voice)
        asset.updateIntent({
            desiredAlt: newflActual
        })
    } else if (isQuestion || interrogative){
        const q = interrogative ? question2 : question
        const thing = q.groups().thing.text();
        if ((thing ==="status" || thing==="location" || thing ==="posit" || thing === "positive" || thing ==="cwas")){
            const assetSPos = asset.getCenterOfMass()
            if (asset.isCapping()){
                sendResponse(callsign, "working " + convertToCGRS(assetSPos.x, assetSPos.y), msg.voice);
            } else if (asset.getNextRoutingPoint()) {
                const rPoint = asset.getNextRoutingPoint()
                const current = convertToCGRS(assetSPos.x, assetSPos.y).replace("+", "");
                const desired = convertToCGRS(rPoint.x, rPoint.y);
                sendResponse(callsign, "passing " + current + ", enroute to " + desired, msg.voice);
            } else {
                if (msg.voice){
                    sendResponse(callsign, "standby")
                } else {
                    sendResponse(callsign, "stby")
                }
            }
        } else if (thing ==="tasking" ){
            if (asset.isOnTask()){
                console.log("TODO -- read back tasking when assigned")
            } else {
                if (asset.getType() === ACType.RPA){
                    sendResponse(callsign,"performing ISR iwas");
                } else {
                    sendResponse(callsign, "no tasking att, XCAS ufn");
                }
            }
        } else if (thing.toLowerCase() ==="eta"){
            if (asset.isCapping()){
                sendResponse(callsign, "I'm already on loc");
            } else{
                sendResponse(callsign, "ETA 5m");
            }
        } else {
            sendResponse(callsign, "I don't understand the question");
        }
    } else if (isRadCheck) {
        let fullCs = callsign
        if (msg.voice) fullCs = callsign.replace("VR", "viper")
        sendResponse(callsign, "go for " + fullCs, msg.voice)
    } else {
        sendResponse(callsign, "I don't understand.")
    }
    
    // if (!continueAnimation){
    //     snackbar("You need to start the sim (Fights On)", undefined, "#FA5D5D");
    // }
}