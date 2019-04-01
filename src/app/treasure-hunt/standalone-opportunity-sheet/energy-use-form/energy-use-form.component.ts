import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-energy-use-form',
  templateUrl: './energy-use-form.component.html',
  styleUrls: ['./energy-use-form.component.css']
})
export class EnergyUseFormComponent implements OnInit {
  @Input()
  energyItems: Array<{ type: string, amount: number }>;

  constructor() { }

  ngOnInit() {
  }

  addEnergyField() {
    this.energyItems.push({
      type: 'Electricity',
      amount: 0.0
    })
  }

  removeEnergyItem(index: number){
    this.energyItems.splice(index, 1);
  }
}
