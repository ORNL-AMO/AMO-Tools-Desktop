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
  percentValue: number;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.focusedFieldSub = this.motorInventoryService.focusedField.subscribe(val => {
      this.focusedField = val;
      if (this.focusedField == 'efficiency75' || this.focusedField == 'powerFactor75') {
        this.percentValue = 75;
      } else if (this.focusedField == 'efficiency50' || this.focusedField == 'powerFactor50') {
        this.percentValue = 50;
      } else if (this.focusedField == 'efficiency25' || this.focusedField == 'powerFactor25') {
        this.percentValue = 25;
      }
    });
  }

  ngOnDestroy() {
    this.focusedFieldSub.unsubscribe();
  }


}
