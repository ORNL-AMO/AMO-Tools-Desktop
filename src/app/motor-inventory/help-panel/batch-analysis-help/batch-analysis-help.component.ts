import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../motor-inventory.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-batch-analysis-help',
  templateUrl: './batch-analysis-help.component.html',
  styleUrls: ['./batch-analysis-help.component.css']
})
export class BatchAnalysisHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.motorInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }

}
