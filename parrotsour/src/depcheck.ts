/**
 * This file contains libraries used for compilation.
 *
 * This file is ignored during builds, and is here for use
 * with npm-check to validate we have the most up-to-date
 * dependencies.
 *
 * TODO -- npm pack / compile / build -- verify contents do
 * not contain __tests__ & depcheck
 */
import "@babel/plugin-transform-flow-strip-types"
import "@babel/plugin-transform-typescript"
import "@babel/preset-flow"
import "@babel/preset-env"
