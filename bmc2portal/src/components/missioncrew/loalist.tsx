import React, { ReactElement } from 'react';

import backend from '../utils/backend';

import SearchInput from '../utils/searchinput'
import LoaPdf from './loapdf';

import '../../css/search.css'
import { ATCAgency } from '../utils/backendinterface';

type LOAListState = {
  loaList: ATCAgency[],
  displayLOAs: ATCAgency[],
  failed: boolean,
  editIdx: number
}

/**
 * This Component contains a searchable/filterable table of the CONUS ATC Agencies
 * and their letters of agreement with the 552 ACW.
 */
export default class LOAList extends React.PureComponent<Record<string,unknown>, LOAListState> {

  // Set default empty state
  constructor(props: Record<string,unknown>){
    super(props)
    this.state = {
      loaList:[],
      displayLOAs:[],
      failed: false,
      editIdx: -1
    }
  }

  // Lifecycle function for after the Component has rendered
  // We load the LOAs after rendering
  componentDidMount():void{
    this.getLOAList();
  }

  // Retrieve the LOA list/data from the backend, and process for display
  async getLOAList():Promise<void>{
    let loas = [];
    try {
      loas = await backend.getLOAList();
      this.setState({loaList: loas, displayLOAs: loas})
    } catch {
      this.setState({ 
        failed:true,
        loaList:[]
      });
    }
  }

  // Filter the table based on search text
  filterLOAs = (value:string):void => {
    value = value.toUpperCase();
    const { loaList } = this.state
    const newLOAs = loaList.filter((item) => {
      let foundMatch = false;
      for (let i = 0; i < item.loaLoc.length; i++){
        if (!foundMatch && item.loaLoc[i].toUpperCase().indexOf(value) > -1)
        foundMatch = true;
      }
      return item.name.toUpperCase().indexOf(value) > -1 || foundMatch
    })
    this.setState({
      displayLOAs: newLOAs
    })
  }

  // Check if we are editing at the current index
  isEdit(idx:number):boolean{
    const {editIdx} = this.state
    return editIdx === idx;
  }

  // Retrieve an element for a row that spans both columns
  rowSpan(text:string): JSX.Element {
      return <tr key={text}><td colSpan={2}>{text}</td></tr>
  }

  // Create the elements for each row in the table
  getLOATableRows(): JSX.Element[] {
    const {failed, displayLOAs, loaList} = this.state
    // Default to "Loading..."
    let tableRows = [this.rowSpan("Loading...")]
    if (this.state){
      // Check if the server is offline, we have an empty database, 
      // or create the elements if there are no errors
      if(failed){
        tableRows = [this.rowSpan("Failed to retrieve data from the server.")]
      } else if (loaList.length===0){
        tableRows = [this.rowSpan("No LOAs in the database")]
      } else {
        tableRows = displayLOAs.map((loa,index)=>{
          return (
            <tr key={loa.name}>
              <td>
                {loa.name}
              </td>
              <td>
                <LoaPdf
                  update
                  loaLoc={loa.loaLoc}
                />
              </td>
            </tr> )
        })
      }
    }
    return tableRows;
  }

  // Main react rendering
  render(): ReactElement {
    return (
      <div>
        <div>
          <div className="searchDiv">
            <SearchInput searchFunc={this.filterLOAs} />
          </div>
        </div>
        <div style={{paddingTop:"5%"}}>
          <table id="loaTable">
            <tbody>
            <tr><th>ATC Agency</th><th>LOA</th></tr>
            {this.getLOATableRows()}
            <tr><td><button type="button">+</button></td><td/></tr>
            </tbody>
          </table>
        </div>
      </div>
    )}
}