import React from 'react';

function ChangeLog():JSX.Element {
    return (
        <div>
            --------------------------------------- <br/>
            Known Bugs <br/>
            <li> Opening/closing pictures don&quot;t always include correct comm</li>
            --------------------------------------- <br/>
            Scheduled Features: <br/>
            <li> Verify anchoring P&quot;s in WALL, CHAMP TRAIL gps, CAP </li>
            <li> Finish opening/closing comm (particularly for range pics) </li>
            <li> CAP for more picture types </li>
            <li> Procedural simulation </li>
            --------------------------------------- <br/>
            --------------------------------------- <br/> 
            Version 3.1.0 - 14 Dec 2020 <br/>
            --------------------------------------- <br/>
            Features
            <li>Finished conversion to typescript - also React Component library for varied use(s)</li>
            <li>Fixed small issue in package comm (labeling/anchoring)</li>
            <li>Implemented radar/arrow toggle (make it look like radar returns instead of arrows)</li>
            <li>Migrated procedural implementation -- working on further development</li>
            --------------------------------------- <br/> 
            Version 3.0.5 - 21 Nov 2020 <br/>
            --------------------------------------- <br/>
            Features
            <li>Bullseye follows mouse on canvas</li>
            <li>Threat now includes &quot;THREAT GROUP&quot; and correct ALSA formatting </li>
            <li>Codebase migrated to React and Typescript </li>
            <li>Components to be easily included in other sites or mobile app </li>
            <li>Massive fixes to animation logic and arrow drawing </li>
            <li>Massive bug hunt and standards adherence (typescript)</li>
            <li>Styling and UI design improvements due to react</li>
            <li>Responsiveness improvement and load time decrase d2 code splitting</li>
            --------------------------------------- <br/> 
            Version 2.0.0 - 30 June 2020 <br/>
            --------------------------------------- <br/>
            Features
            <li> N/S orientation toggle </li>
            <li> Added toggle to swap BRAA/BULLSEYE display order on screen </li>
            <li> Fixed anchoring P&quot;s for some picture types </li>
            <li> Reduced code base size </li>
            --------------------------------------- <br/>
            Hot Patch - 28 June 2020 <br/>
            --------------------------------------- <br/>
            Features
            <li>Fixed anchoring priorities for some picture types</li>
            <li>Fixed several small bugs </li>
            <li>Fixed a measurement issue (stale measurement on screen)</li>
            --------------------------------------- <br/>
            Version 1.3.4 - 10 June 2020 <br/>
            --------------------------------------- <br/>
            Features
            <li> Implemented opening closing for azimuth </li>
            <li> Fixed several reported issues </li>
            --------------------------------------- <br/>
            Version 1.3.3 - 3 Mar 2020 <br/>
            --------------------------------------- <br/>
            Hot fixes:
            <li> Implemented EA / Bogey Dope request/response</li>
            <li> Multi-blue air formation bug fix </li>
            --------------------------------------- <br/>
            Version 1.3.1 - 2 Mar 2020 <br/>
            --------------------------------------- <br/>
            Features
            <li> &quot;Hard Mode&quot;: random track direction and assess for echelon/weighted </li>
            <li> Implemented CAP and package </li>
            <li> Bug reporting via email submission </li>
            Hot fixes:
            <li> Braaseye drawing accuracy improved </li>
            --------------------------------------- <br/>
            Version 1.2.2 - 22 Feb 2020 <br/>
            --------------------------------------- <br/>
            Hot fixes:
            <li> ALSA help button now has a link to the actual pub </li>
            <li> THREAT as a picture type</li>
            --------------------------------------- <br/>
            Version 1.2.1 - 18 Feb 2020 <br/>
            --------------------------------------- <br/>
            Features
            <li> Expanded quick tips</li>
            <li> ALSA comm format now has a help button </li>
            <li> Initial support for mobile browsing and Touch-to-Measure</li>
            Hot fixes:
            <li> Measuring before/mid fight bugs fixed </li>
            <li> Minor styling improvements </li>
            <li> Code splitting improvements </li> 
            --------------------------------------- <br/>
            Version 1.2 - 16 Feb 2020 <br/>
            --------------------------------------- <br/>
            Features
            <li> Select desired picture type </li>
            <li> Leading edge pictures </li>
            Patches:
            <li> Minor formatting fixes (stacks, high, anchoring &gt;10 nm)</li>
            <li> Minor appearance fixes (track dir, leading edge)</li>
            <li> Measure to pause the animation. Release resumes animation. </li>
            --------------------------------------- <br/>
            Version 1.1 - 06 Nov 2019 <br/>
            --------------------------------------- <br/>
            Features
            <li> Red air animations are &quot;smarter&quot; </li>
            <li> Initial Red air basic maneuvers (picks new heading at predetermined range from blue) </li>
            Patches:
            <li> Minor math calculations fixed </li>
            <li> Canvas styling to help math calculations fix </li>
            --------------------------------------- <br/>
            Version 1 - 05 Nov 2019 <br/>
            --------------------------------------- <br/>
            Features:
            <li>Initial picture drawing with random # contacts, altitudes</li> 
            <li>Initial red air animation</li>
            <li>Tac B/R drawing with mouse</li>
            <li>ALSA comm as the answer format</li>
            <br/>
            <br/>
    </div>
    )
}

export default ChangeLog