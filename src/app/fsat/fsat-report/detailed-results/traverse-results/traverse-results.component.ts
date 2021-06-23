import { Component, Input, OnInit } from '@angular/core';
import { Fan203Inputs, FSAT, PlaneResults } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
import { FsatService } from '../../../fsat.service';
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

  showFull: boolean = false;


  planeResults: PlaneResults;
  inputs: Fan203Inputs;

  
  constructor(private fsatService: FsatService) { }

  ngOnInit(): void {    
    this.planeResults = this.fsat.outputs.planeResults;

    this.inputs = this.fsatService.getFan203InputForPlaneResults(this.fsat);
    
  }

  

}
