import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterService } from '../../../waste-water.service';

@Component({
  selector: 'app-activated-sludge-help',
  templateUrl: './activated-sludge-help.component.html',
  styleUrls: ['./activated-sludge-help.component.css']
})
export class ActivatedSludgeHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.wasteWaterService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy(){
    this.focusedFieldSub.unsubscribe();
  }
}
