import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { StatePointAnalysisService } from '../state-point-analysis.service';

@Component({
  selector: 'app-state-point-analysis-help',
  templateUrl: './state-point-analysis-help.component.html',
  styleUrls: ['./state-point-analysis-help.component.css']
})
export class StatePointAnalysisHelpComponent implements OnInit {

  @Input()
  settings: Settings;
  
  currentField: string;
  currentFieldSub: Subscription;
  constructor(private statePointAnalysisService: StatePointAnalysisService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.statePointAnalysisService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }

  ngOnDestroy(){
    this.currentFieldSub.unsubscribe();
  }

}