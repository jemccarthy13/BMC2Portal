import { Aircraft } from "classes/groups/aircraft";
import { SensorType } from "classes/groups/datatrail";
import { IDMatrix } from "classes/groups/id";
import { Point } from "classes/point";
import { headingToRadians, PIXELS_TO_NM, toRadians } from "utils/psmath";

export class PaintBrush { 

    private ctx: CanvasRenderingContext2D

    constructor(ctx: CanvasRenderingContext2D){
        this.ctx = ctx
    }

    private _drawSymbology(
        id:IDMatrix,
        startx:number,
        starty:number,
        prevX:number,
        prevY:number)
    {
        const deltX = startx - prevX
        const deltY = starty - prevY

        this.ctx.strokeStyle = id

        if (id===IDMatrix.FRIEND){
          // draw friend symbology (blue arc/upside-down U)
          this.ctx.beginPath()
          this.ctx.moveTo((startx+deltX)-2.5, (starty+deltY)-2.5)
          this.ctx.arc(
            startx+deltX-2.5,
            starty+deltY-0.5, 
            2.5, 
            toRadians(180), 
            toRadians(360))
          this.ctx.stroke()
        } else {
          this.ctx.beginPath()
          const headX = (startx+deltX)-3
          const headY = (starty+deltY)-3
          
          const leftX = headX + 5*Math.cos(toRadians(240))
          const leftY = headY + 5-Math.sin(toRadians(240))
          this.ctx.moveTo(headX, headY)
          this.ctx.lineTo(leftX,leftY)
          
          const rightX = headX + 5*Math.cos(toRadians(300))
          const rightY = headY + 5-Math.sin(toRadians(300))
          this.ctx.moveTo(headX,headY)
          this.ctx.lineTo(rightX,rightY)
          this.ctx.stroke()
          this.ctx.stroke()
        }
    }

    private _drawRadarIff(
        id: IDMatrix,
        startx:number,
        starty:number,
        endx:number,
        endy:number,
        radarPts: Point[], 
        iffPts:Point[],
        drawnRadar:Point[]): { rdrPts: Point[], iPts:Point[], drawnRdr:Point[]}
    {
        // set initial point(s) and math calculations
        this.ctx.beginPath()
        let xPos = startx
        let yPos = starty
        const offsetX = (endx-startx) / PIXELS_TO_NM
        const offsetY = (endy-starty)/ PIXELS_TO_NM
      
        const rdrPts:Point[] = []
        const iPts: Point[] = []
        const drawnRdr: Point[] = []
      
        // draw the radar trail
        if (!radarPts || radarPts.length === 0){
          for (let mult = 0; mult< 5; mult++){
            // add a bit of jitter with randomness
            const jit = id === IDMatrix.FRIEND ? 1 : 5
            xPos = startx+ offsetX*mult + jit* Math.random()+Math.random()+Math.random()
            yPos = starty+offsetY*mult + jit*Math.random()+Math.random()+Math.random()
            const rdrPt = new Point(xPos, yPos)
            rdrPts.push(rdrPt)
            drawnRdr.push(rdrPt)
          }
        } else {
          for (let i = 0; i < drawnRdr.length; i++){
            rdrPts.push(radarPts[i])
          }
          for (let idx = 0; idx < drawnRadar.length; idx++){
            drawnRdr.push(drawnRadar[idx])
          } 
        }
      
        // Draw radar dots
        this.ctx.strokeStyle = "#FF8C00"
        drawnRdr.forEach((pt) =>{
            this.ctx.beginPath()
            this.ctx.moveTo(pt.x, pt.y)
            this.ctx.lineTo(pt.x-3, pt.y-3)
            this.ctx.stroke()
            this.ctx.stroke()
        })
        this.ctx.strokeStyle = id
        
        // Draw IFF dots
        if (id === IDMatrix.FRIEND || id === IDMatrix.ASSUME_FRIEND || id === IDMatrix.NEUTRAL){
          xPos = startx
          yPos = starty
      
          // draw IFF
          if (!iffPts || iffPts.length === 0){
            for (let mult = 0; mult < 4; mult++){
              xPos = startx+ (offsetX*mult) + (offsetX*0.5)
              yPos = starty+ (offsetY*mult) + (offsetY*0.5)
              iPts.push(new Point(xPos,yPos))    
            }
          } else {
            for (let k=0; k < iffPts.length; k++){
              iPts.push(iffPts[k])
            }
          }
          
          this.ctx.strokeStyle = "blue"
          for (let l = 0; l < iPts.length; l++){
            xPos=iPts[l].x
            yPos=iPts[l].y
            this.ctx.beginPath()
            this.ctx.moveTo(xPos, yPos)
            this.ctx.lineTo(xPos-3, yPos)
            this.ctx.lineTo(xPos-3, yPos-3)
            this.ctx.lineTo(xPos, yPos-3)
            this.ctx.lineTo(xPos, yPos)
            this.ctx.stroke()
          }
          this.ctx.strokeStyle = id
        } 
              
        // Draw symbology (one 'plot' ahead of radar data)
        const cPt = rdrPts[rdrPts.length-1]
        const pPt = rdrPts[rdrPts.length-2]
        this._drawSymbology(id, cPt.x,cPt.y, pPt.x, pPt.y)

        // Draw vector stick
        this.ctx.strokeStyle="black"
        this.ctx.beginPath()
        const deltX = cPt.x-pPt.x
        const deltY = cPt.y-pPt.y
        this.ctx.moveTo((cPt.x+deltX)-2.5, (cPt.y+deltY)-2.5)
        this.ctx.lineTo((cPt.x+deltX*1.5)-2.5, (cPt.y+deltY*1.5)-2.5)
        this.ctx.stroke()
        this.ctx.stroke()
      
        return {rdrPts, iPts, drawnRdr }
    }
      
    /**
     * Draw data trail (or arrows) for an Aircraft
     * 
     * @param ac Contains aircraft information
     * @param numContacts Number of contacts in the group
     * @param startx Start X position for the group
     * @param starty Start Y position for the group
     * @param heading Heading of the group
     * @param color (optional) Color of the arrow lines, default red
     * @param type (optional) Type of aircraft, default "ftr" (fighter)
     */
    drawAircraftSensorData(
        acft: Aircraft,
        startx:number,
        starty:number,
        dataType: SensorType,
        rdrPts:Point[][]=[],
        iffPts:Point[][]=[],
        drawnRadar:Point[][]=[] ): void {

        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = acft.getIDMatrix();

        let endx = 0
        let endy = 0

        const vector = headingToRadians(acft.getHeading()) 

        startx += PIXELS_TO_NM*(Math.cos(vector.offset))
        starty += PIXELS_TO_NM*(-Math.sin(vector.offset))

        if (dataType === SensorType.ARROW){
                
            const dist:number = this.ctx.canvas.width / (this.ctx.canvas.width / 20);
            
            endy = starty + dist * -Math.sin(vector.radians);
            endx = startx + dist * Math.cos(vector.radians);
                
            this.ctx.beginPath()  
            this.ctx.moveTo(startx, starty);
            this.ctx.lineTo(endx, endy);

            const heady:number = endy + 7 * -Math.sin(vector.headAngle)
            const headx:number = endx + 7 * Math.cos(vector.headAngle)
            
            this.ctx.lineTo(headx, heady);
            
            this.ctx.strokeStyle = acft.getIDMatrix();
            this.ctx.stroke();
            this.ctx.stroke();
            this.ctx.stroke();
        } else {
            const dist:number = this.ctx.canvas.width / (this.ctx.canvas.width / 35);
            endy = starty + dist * -Math.sin(vector.radians);
            endx = startx + dist * Math.cos(vector.radians);

            const retVal = this._drawRadarIff(acft.getIDMatrix(), startx, starty, endx, endy, rdrPts[0], iffPts[0], drawnRadar[0])
        }
    }
}
