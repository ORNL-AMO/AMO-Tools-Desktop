import { Component, OnInit, Input } from '@angular/core';
import { AirLeakService } from '../air-leak.service';
import { AirLeakSurveyOutput } from '../../../../shared/models/standalone';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-air-leak-results-table',
    templateUrl: './air-leak-results-table.component.html',
    styleUrls: ['./air-leak-results-table.component.css'],
    standalone: false
})
export class AirLeakResultsTableComponent implements OnInit {

  airLeakOutput: AirLeakSurveyOutput;
  airLeakOutputSub: Subscription;
  
  resetDataSub: Subscription;
  allSelected: boolean = false;

  @Input()
  settings: Settings;

  constructor(private airLeakService: AirLeakService) { }

  ngOnInit(): void {
    this.airLeakOutputSub = this.airLeakService.airLeakOutput.subscribe(value => {
      this.airLeakOutput = value;
    });
    this.resetDataSub = this.airLeakService.resetData.subscribe(value => {
      if (value) {
        this.allSelected = false;
      } 
    });
  }
  
  ngOnDestroy() {
    this.airLeakOutputSub.unsubscribe();
  }

  editLeak(index: number) {
    this.airLeakService.currentLeakIndex.next(index);
  }

  copyLeak(index: number) {
    this.airLeakService.copyLeak(index);
  }

  deleteLeak(index: number) {
    this.airLeakService.deleteLeak(index);
  }

  toggleSelected(index: number, selected: boolean) {
    this.airLeakService.setLeakForModification(index, selected);
  }

  toggleSelectAll(){
    this.airLeakService.setLeakForModificationSelectAll(!this.allSelected);
    this.allSelected = !this.allSelected;
  }

}
