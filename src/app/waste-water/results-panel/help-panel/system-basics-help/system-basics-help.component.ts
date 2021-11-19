import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterService } from '../../../waste-water.service';

@Component({
  selector: 'app-system-basics-help',
  templateUrl: './system-basics-help.component.html',
  styleUrls: ['./system-basics-help.component.css']
})
export class SystemBasicsHelpComponent implements OnInit {

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
