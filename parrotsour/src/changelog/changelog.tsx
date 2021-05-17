import React from "react"

import BugList from "./buglist"
import FeatureList from "./featurelist"
import VersionHistory from "./versionhistory"

/**
 * A Component to pretty render release notes, anticipated features, and reported bugs.
 *
 * @returns A Component containing a buglist, featurelist, and Release history.
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
