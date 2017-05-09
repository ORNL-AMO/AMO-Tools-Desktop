import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent implements OnInit {
  @Input()
  selectedCalculator: string;
  constructor() { }

  ngOnInit() {
    console.log(this.selectedCalculator);
  }

}
