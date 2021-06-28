import { Component, Input, OnInit } from '@angular/core';
import {  FSAT, PlaneResults } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-traverse-results',
  templateUrl: './traverse-results.component.html',
  styleUrls: ['./traverse-results.component.css']
})
export class TraverseResultsComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  fsatName: string;


  planeResults: PlaneResults;

  

  
  constructor() { }

  ngOnInit(): void {
    this.planeResults = this.fsat.outputs.planeResults;
    
  }

  

}
