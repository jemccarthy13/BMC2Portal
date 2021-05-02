export class Snackbar {
    // Displays a snackbar notification in the lower portion of the screen
    public static async alert(text:string, timeout: number|undefined, color = "#4caf50"): Promise<void> {
      const x: HTMLElement|null = document.getElementById("snackbar");
      if (x){
        x.innerText = text;
        x.className = "show";
        x.style.backgroundColor = color;
        timeout = (timeout === undefined) ? 3000 : timeout;
        setTimeout(function(){ 
          if (x) x.className = x.className.replace("show", ""); 
        }, timeout);
      }
  }
}