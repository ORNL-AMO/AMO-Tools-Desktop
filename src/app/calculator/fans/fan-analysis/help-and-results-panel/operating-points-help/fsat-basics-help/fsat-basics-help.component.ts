import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FanAnalysisService } from '../../../fan-analysis.service';

@Component({
    selector: 'app-fsat-basics-help',
    templateUrl: './fsat-basics-help.component.html',
    styleUrls: ['./fsat-basics-help.component.css'],
    standalone: false
})
export class FsatBasicsHelpComponent implements OnInit {

  currentField: string;
  currentFieldSubscription: Subscription;
  constructor(private fanAnalysisService: FanAnalysisService) { }

  ngOnInit() {
    this.currentFieldSubscription = this.fanAnalysisService.currentField.subscribe(val => {
      this.currentField = val;
    })
  }

  ngOnDestroy(){
    this.currentFieldSubscription.unsubscribe();
  }

}
