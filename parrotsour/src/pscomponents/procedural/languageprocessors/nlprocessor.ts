import nlp from "compromise"

import sentences from "compromise-sentences"
nlp.extend(sentences) // add support for isQuestion

/**
 * Extend compromise with 'tac-chat' specific
 * domain knowledge to make it 'smarter'
 */
// eslint-disable-next-line
nlp.extend((Doc: any, world: any) => {
  world.addWords({
    transit: "Verb",
    climb: "Verb",
    elev: "Verb",
    elevator: "Verb",
    posit: "Noun",
    proceed: "Verb",
    FL: "Unit",
    tasking: "Noun",
    state: "Noun",
  })
})

/**
 * This class wraps the nlp (compromise) package
 * to provide global (static) access to the ParrotSour extended
 * compromise; so the layers can use PS NLP to understand
 * domain knowledge of procedural commands and jargon.
 */
export class AIProcessor {
  public static process(text: string): nlp.DefaultDocument {
    return nlp(text)
  }
}
