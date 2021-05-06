import React, { ChangeEvent, ReactElement, useState } from "react"

type IssueSelectorProps = {
  selectionChanged: (val: string) => () => void
}

const IssueSelector = (props: IssueSelectorProps): ReactElement => {
  const [prevSel, setPrevSel] = useState("picprob")

  function handleClick(evt: ChangeEvent) {
    if (evt.target.id !== prevSel) {
      props.selectionChanged(evt.target.id)
      setPrevSel(evt.target.id)
    }
  }

  return (
    <div className="pscontainer">
      <h2>
        <u>Problem:</u>
      </h2>
      <ul>
        <li>
          <input
            style={{ color: "grey" }}
            type="radio"
            id="picprob"
            name="issue"
            value="picprob"
            defaultChecked
            onChange={handleClick}
          />
          <label id="piclbl" htmlFor="picprob" style={{ color: "grey" }}>
            The answer to this picture is incorrect
          </label>
          <div className="check-no-hover" />
        </li>
        <li>
          <input
            style={{ color: "grey" }}
            type="radio"
            id="feature"
            name="issue"
            value="feature"
            onChange={handleClick}
          />
          <label htmlFor="feature" style={{ color: "grey" }}>
            Wouldn&lsquo;t it be nice if...
          </label>
          <div className="check-no-hover" />
        </li>
        <li>
          <input
            type="radio"
            id="othprob"
            name="issue"
            value="othprob"
            onChange={handleClick}
          />
          <label htmlFor="othprob" style={{ color: "grey" }}>
            Something else{" "}
          </label>
          <div className="check-no-hover" />
        </li>
      </ul>
    </div>
  )
}

export default IssueSelector
