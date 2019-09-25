import { Component, OnInit, Input } from '@angular/core';
import { collapseAnimation } from '../collapse-animations';

@Component({
  selector: 'app-equipment-curve',
  templateUrl: './equipment-curve.component.html',
  styleUrls: ['./equipment-curve.component.css'],
  animations: collapseAnimation
})
export class EquipmentCurveComponent implements OnInit {
  @Input()
  equipmentType: string;
  @Input()
  isPrimaryCalculator: boolean;

  equipmentCurveCollapsed: string = 'closed';
  title: string;
  constructor() { }

  ngOnInit() {
    if(this.isPrimaryCalculator == true){
      this.equipmentCurveCollapsed = 'open';
    }
    this.setTitle();
  }

  setTitle(){
    if(this.equipmentType == 'pump'){
      this.title = 'Pump';
    }else if(this.equipmentType == 'fan'){
      this.title = 'Fan';
    }
  }

  toggleCollapse() {
    if (this.equipmentCurveCollapsed == 'closed') {
      this.equipmentCurveCollapsed = 'open';
    } else {
      this.equipmentCurveCollapsed = 'closed';
    }
  }
}
