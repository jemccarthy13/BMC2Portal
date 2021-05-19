/* eslint-disable no-redeclare */
/* eslint-disable complexity */
/* eslint-disable no-undef */

/**
 * This file is for temporary reference only and should be incorporated into the 
 * React Component structure and refactored to reduce complexity.
 */

nlp.extend((Doc, world) => {
    world.addWords({
        transit: 'Verb',
        climb: 'Verb',
        elev: "Verb",
        elevator: 'Verb',
        posit:'Noun',
        proceed: 'Verb',
        FL: 'Unit',
        tasking:'Noun',
        state:'Noun'
    })
});

function makeRequest(group){
    if (group.request === undefined){
        var requestType = randomNumber(1,3);
        var newAs = undefined;
        var newAlt = undefined;
        newX = randomNumber(50, canvas.width);
        newY = randomNumber(50, canvas.height);
        switch (requestType){
            case 1:
                newAs = convertToCGRS(newX, newY);
                break;
            case 2:
                newAlt = randomNumber(5,18);
                while (newAlt === group.z[0]) { newAlt = randomNumber(5,18); }
                break;
            default:
                newAs = convertToCGRS(newX, newY);
                newAlt = randomNumber(5,18);
                while (newAlt === group.z[0]) { newAlt = randomNumber(5,18); }
                break;
        }

        if (requestType === 2){
            reason = "weather";
        } else {
            reason = "new tasking";
        }
        group.request = {
            airspace: newAs,
            alt: newAlt || group.z
        };

        var as = newAs ? newAs : "";
        var alt = newAlt ? "FL " + formatAlt(newAlt) : "";
        sendMessage("chatroom", group.callsign, "C2, " + group.callsign + " request " + as+" " + alt + " for " + reason)
    }
}

function makeRequests(groups){
    let count = 5;
    groups.forEach((grp) => {
        //window.setInterval(()=>{makeRequest(grp)}, count*1000);
        count+=5;
        window.setInterval(()=>{makeRequest(grp)}, randomNumber(30, 60)*1000);
        //window.setInterval(()=>{makeRequest(grp)}, randomNumber(1,5)*1000);
    })
}

function aiProcessOld(msgText){
    
    msgText = msgText.toUpperCase();
    let re = new RegExp("([0-9]+[A-Z]+[0-9]*)");
    let matches = msgText.match(re);
    var cgrs = "";
    if (matches){
        console.log("loop replace cgrs");
        matches.forEach((elem) => {
            let xy = convertToXY(elem);
            msgText = msgText.replace(elem, xy.x + " " + xy.y);
            cgrs = elem;
        });
    }    
    msgText=msgText.toLowerCase();
    msgText = msgText.replace('your','');

    var nl = nlp(msgText);

    var assetMsg = nl.match("[<cs>#Noun] *");
    var cmd = nl.match("[<cs>#Noun] [<act>#Verb] #Unit [<fl>#Cardinal]");
    var move = nl.match("[<cs>#Noun] [<cmd>#Verb?] * [<x>#Cardinal] [<y>#Cardinal]");
    var move3d = nl.match("[<cs>#Noun] [#Verb?] * [<x>#Cardinal] [<y>#Cardinal] app? [#Verb?] [#Preposition?] #Unit [<fl>#Cardinal]")
    var desert3d = nl.match("[<cs>#Noun] [#Verb?] * [<x>#Cardinal] [<y>#Cardinal] * app? * [#Verb?] [#Preposition?] #Unit [<fl>#Cardinal]")
    var question = nl.match('[<cs>#Noun] * [<thing>#Noun] *');

    console.log(nl);
    var callsign = assetMsg.groups().cs.text().toUpperCase();
    var asset = getAsset(groups, callsign);

    isCommand = cmd.found;
    isMove = move.found;
    isMove3d = move3d.found;
    isQuestion = nl.sentences().isQuestion().length > 0;

    if (isMove){
        if (asset){       
            var cmd = move.groups().cmd
            var cmdText = cmd ? cmd.text() : undefined;
            if (!cmdText || (cmdText ==="transit" || cmdText ==="proceed" || cmdText==="move")){
                var locX = move.groups().x.text();
                var locY = move.groups().y.text();
                if (isMove3d){
                    var fl = move3d.groups().fl.text();
                    setDesiredFL(asset,fl);
                }

                sendMessage("chatroom", callsign, "c, " + (cmd ? cmd.verbs().toGerund().text() : "moving") + " to " + ((cgrs!=="") ? cgrs:
                (locX +"," + locY)) + 
                (isMove3d ? (" at FL " + fl) : ""));

                asset.desiredLoc = [{x:locX, y:locY}];
                asset.capping = false;
            } else {
                sendMessage("chatroom", callsign, "I don't understand " + cmd.text());
            }   
            
        } else {
            sendMessage("chatroom", "SYSTEM", "Asset unknown.");
        }
    }
    else if (isCommand){
        if (asset){
            var fl = cmd.groups().fl.text();
            sendMessage("chatroom", callsign, "c, " + cmd.groups().act.verbs().toGerund().text() + " " + fl)
            console.log("UPDATE TRACK");
            // console.log(asset);
            setDesiredFL(asset,fl);
        } else {
            sendMessage("chatroom", "SYSTEM", "Asset unknown.");
        }
    } else if (isQuestion){
        var thing = question.groups().thing.text();
        
        if (!asset){
            sendMessage("chatroom", "SYSTEM", "Asset unknown.");
        } else if ((thing ==="status" || thing==="location" || thing ==="posit" || thing ==="cwas")){
            if (asset.capping){
                sendMessage("chatroom", callsign, "working " + convertToCGRS(asset.startX, asset.startY));
            } else {
                current = convertToCGRS(asset.startX, asset.startY).replace("+", "");
                desired = convertToCGRS(asset.desiredLoc[0].x, asset.desiredLoc[0].y);
                sendMessage("chatroom", callsign, "passing " + current + ", enroute to " + desired);
            }
        } else if (thing ==="tasking" ){
            if (asset.tasking){
                console.log("TODO -- read back tasking when assigned")
            } else {
                if (asset.type==="rpa"){
                    sendMessage("chatroom", callsign,"performing ISR iwas");
                } else {
                    sendMessage("chatroom", callsign, "no tasking att, XCAS ufn");
                }
            }
        } else if (thing.toLowerCase() ==="eta"){
            if (asset.capping){
                sendMessage("chatroom", callsign, "I'm already on loc");
            } else{
                sendMessage("chatroom", callsign, "ETA 5m");
            }
        } else {
            sendMessage("chatroom", callsign, "I don't understand the question");
        }
    } else{
        sendMessage("chatroom", callsign, "I don't understand.")
    }
    
    if (!continueAnimation){
        snackbar("You need to start the sim (Fights On)", undefined, "#FA5D5D");
    }
}