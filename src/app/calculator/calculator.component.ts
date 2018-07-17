import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CalculatorService } from './calculator.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent implements OnInit {
  selectedTool: string;
  selectedToolSub: Subscription
  selectedCalculatorSub: Subscription;
  selectedCalculator: string;
  constructor(private calculatorService: CalculatorService) { }

  ngOnInit() {
    this.selectedToolSub = this.calculatorService.selectedTool.subscribe(toolStr => {
      this.selectedTool = toolStr;
    })
    this.selectedCalculatorSub = this.calculatorService.selectedToolType.subscribe(calcStr => {
      this.selectedCalculator = calcStr;
    })
  }

  ngOnDestroy(){
    this.calculatorService.selectedTool.next('none');
    this.calculatorService.selectedToolType.next(undefined);
    this.selectedToolSub.unsubscribe();
    this.selectedCalculatorSub.unsubscribe();
  }

  showTool(calc: string, tool: string) {
    this.calculatorService.selectedTool.next(tool);
    this.calculatorService.selectedToolType.next(calc);
  }
}
