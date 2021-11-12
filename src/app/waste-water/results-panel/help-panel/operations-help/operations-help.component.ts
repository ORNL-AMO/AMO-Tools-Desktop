import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterService } from '../../../waste-water.service';

@Component({
  selector: 'app-operations-help',
  templateUrl: './operations-help.component.html',
  styleUrls: ['./operations-help.component.css']
})
export class OperationsHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;
  constructor(private wasteWaterService:WasteWaterService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.wasteWaterService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }

}
