import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FSAT, FieldData } from '../../../../shared/models/fans';

@Component({
  selector: 'app-field-data-summary',
  templateUrl: './field-data-summary.component.html',
  styleUrls: ['./field-data-summary.component.css']
})
export class FieldDataSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  printView: boolean;

  //this object will hold all FieldData objects for the assessment
  //we define the baseline and the array of modifications separately for consistency
  fieldData: { baseline: FieldData, modifications: Array<FieldData> };
  
  collapse: boolean = true;
  numMods: number = 0;

  constructor() { }

  ngOnInit() {


  }



  toggleCollapse() {
    this.collapse = !this.collapse;
  }


}
