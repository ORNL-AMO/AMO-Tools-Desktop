import { Component, OnInit } from '@angular/core';
import { MotorInventoryService } from '../../motor-inventory.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-load-characteristics-help',
  templateUrl: './load-characteristics-help.component.html',
  styleUrls: ['./load-characteristics-help.component.css']
})
export class LoadCharacteristicsHelpComponent implements OnInit {

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
