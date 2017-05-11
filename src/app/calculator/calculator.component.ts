import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent implements OnInit {
  @Input()
  selectedCalculator: string;
  @Output('selectCalculator')
  selectCalculator = new EventEmitter<string>();

  selectedTool: string;
  isFirstChange: boolean = true;
  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedCalculator && !this.isFirstChange) {
      if (changes.selectedCalculator.currentValue == 'all') {
        this.selectedTool = 'none';
      }
    } else {
      this.isFirstChange = false;
    }
  }


  ngOnInit() {
    this.selectedTool = 'none';
  }

  showTool(calc: string, tool: string) {
    this.selectedTool = tool;
    this.selectCalculator.emit(calc);
  }

}
