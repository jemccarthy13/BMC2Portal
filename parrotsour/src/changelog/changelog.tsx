/* eslint-disable react/forbid-component-props */
import React from "react"

import BugList from "./buglist"
import FeatureList from "./featurelist"
import VersionHistory from "./versionhistory"

/**
 * TODO -- CHANGELOG -- Add a subcomponent to render a pretty list of releases.
 *
 * Not this ugly thing. (Think: expandables with xx characters showing + "read more"),
 * with the most recent one auto expanded.
 *
 * Example:
 *
 * Latest: v. 4.0.0.
 * Major Refactor
 * -- Explanation of new thought process and how certain internals have changed.
 * -- Added documentation, see the new README for examples of how to use this library.
 * -- Did x
 * -- Did y
 *
 * 12/30/2021 - v. 3.x.x.
 * Short Title
 * -- Did x
 * -- Did y
 *
 * @returns The table of Releases in the changelog.
 */

export default function ChangeLog(): JSX.Element {
  return (
    <div style={{ paddingBottom: "200px" }}>
      <BugList />
      <FeatureList />
      <VersionHistory />
    </div>
  )
}
