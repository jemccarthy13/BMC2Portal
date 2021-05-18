import { Cookies } from "react-cookie-consent"

const SliderCookie = "SavedSpeedSlider"
const BraaFirstCookie = "UserWantBraaFirst"
const DataStyleCookie = "DataStyleIsRadar"
const OrientCookie = "Orientation"
const HardModeCookie = "UserWantHardMode"
const WantMeasureCookie = "UserWantMeasure"

/**
 * A class to wrap CookieConsent cookies to store user preferences. Abstracts out the
 * strings and get/set of cookies as an internal API of sorts.
 */
export default class PSCookies {
  // static instance loads user's saved cookies
  private static profileInstance: PSCookies = new PSCookies()

  private speedSlider: number
  private braaFirst: boolean
  private dataStyle: boolean
  private isOrientNS: boolean
  private isHardMode: boolean
  private isWantMeasure: boolean

  constructor() {
    let savedSliderVal = parseInt(Cookies.get(SliderCookie))
    if (Number.isNaN(savedSliderVal)) {
      savedSliderVal = 50
    }
    this.speedSlider = savedSliderVal

    const savedBraaFirst = Cookies.get(BraaFirstCookie)
    this.braaFirst = false
    if (savedBraaFirst === "true") {
      this.braaFirst = true
    }

    const savedDataStyle = Cookies.get(DataStyleCookie)
    this.dataStyle = false
    if (savedDataStyle === "true") {
      this.dataStyle = true
    }

    const savedOrientation = Cookies.get(OrientCookie)
    this.isOrientNS = false
    if (savedOrientation === "true") {
      this.isOrientNS = true
    }

    const savedHardMode = Cookies.get(HardModeCookie)
    this.isHardMode = false
    if (savedHardMode === "true") {
      this.isHardMode = true
    }

    const savedWantMeasure = Cookies.get(WantMeasureCookie)
    this.isWantMeasure = false
    if (savedWantMeasure === "true") {
      this.isWantMeasure = true
    }
  }

  /**
   * These static accessors and mutators handle the set/retrieve of cookies
   * throughout the application.
   */
  public static getSliderValue(): number {
    return this.profileInstance.speedSlider
  }

  public static setSliderValue(newVal: number): void {
    Cookies.set(SliderCookie, newVal)
  }

  public static getBraaFirst(): boolean {
    return this.profileInstance.braaFirst
  }

  public static setBraaFirst(newVal: boolean): void {
    Cookies.set(BraaFirstCookie, newVal)
  }

  public static getDataStyleIsRadar(): boolean {
    return this.profileInstance.dataStyle
  }

  public static setDataStyleIsRadar(newVal: boolean): void {
    Cookies.set(DataStyleCookie, newVal)
  }

  public static getOrientNS(): boolean {
    return this.profileInstance.isOrientNS
  }

  public static setOrientNS(newVal: boolean): void {
    Cookies.set(OrientCookie, newVal)
  }

  public static getHardMode(): boolean {
    return this.profileInstance.isHardMode
  }

  public static setHardMode(newVal: boolean): void {
    Cookies.set(HardModeCookie, newVal)
  }

  public static getWantMeasure(): boolean {
    return this.profileInstance.isWantMeasure
  }

  public static setWantMeasure(newVal: boolean): void {
    Cookies.set(WantMeasureCookie, newVal)
  }
}
