/**
 * Convert a given portion of text to the phonetic spelling
 * (currently used to assist voice reply in communicating in an
 * 'expected' way - 78AM is 'seventy eight alpha mike')
 *
 * Future use could be for time (1800Z = 18 hundred zulu)
 * or tasking (target LK137 = Lima Kilo one three seven)
 *
 * @param text string to convert - will convert all letters of the string to phonetic
 * @returns new string in phonetic spelling
 */
export function convertToNATOPhonetic(text: string): string {
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
  return [...text.toUpperCase()].map((x) => (m.get(x) ? m.get(x) : x)).join(" ")
}
