import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {  FSAT, PlaneResults } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
@Component({
    selector: 'app-traverse-results',
    templateUrl: './traverse-results.component.html',
    styleUrls: ['./traverse-results.component.css'],
    standalone: false
})
export class TraverseResultsComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  fsat: FSAT;
  @Input()
  fsatName: string;


  planeResults: PlaneResults;

  
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;
  
  constructor() { }

  ngOnInit(): void {
    this.planeResults = this.fsat.outputs.planeResults;
    
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

}
