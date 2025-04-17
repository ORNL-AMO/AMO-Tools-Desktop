import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../motor-inventory.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../../shared/models/settings';

@Component({
    selector: 'app-batch-analysis-help',
    templateUrl: './batch-analysis-help.component.html',
    styleUrls: ['./batch-analysis-help.component.css'],
    standalone: false
})
export class BatchAnalysisHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;
  settings: Settings;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.settings = this.motorInventoryService.settings.getValue();
    this.focusedFieldSub = this.motorInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }

}
