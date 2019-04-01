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

}
