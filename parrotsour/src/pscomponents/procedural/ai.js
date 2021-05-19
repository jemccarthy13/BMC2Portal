/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */

/**
 * This file is for temporary reference only and tasking logic should be incorporated
 * into the procedural animation handler
 */
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