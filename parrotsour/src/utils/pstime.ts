/*
  A 'sleep', mostly used for the animation logic
*/
export function sleep(ms:number, callback:()=>void): {promise:Promise<unknown>, cancel: ()=>void} {
    let timeout:NodeJS.Timeout 
    const promise = new Promise(function(resolve) {
      timeout = setTimeout(function() {
        callback()
        resolve('timeout done');
      }, ms);
    }); 
  
    return {
      promise:promise, 
      cancel:function(){ clearTimeout(timeout );} 
    };
}
  
/**
 * Format a portion of a timestamp to 2 digits 
 * @param time number to format to 2 digits if less than 10
 */
function formatT(time:number){
    let retVal:string = time.toString();
    if (time <= 9){
        retVal = "0" + time;
    }
    return retVal;
}
  
/**
 * Get a HH:mm:ss timestamp (for messages)
 */
export function getTimeStamp():string {
    const date = new Date();
    return formatT(date.getHours()) + ":" + formatT(date.getMinutes()) + ":" + formatT(date.getSeconds());
}