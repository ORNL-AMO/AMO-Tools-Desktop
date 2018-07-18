import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CalculatorService } from '../calculator.service';

@Component({
  selector: 'app-furnaces',
  templateUrl: './furnaces.component.html',
  styleUrls: ['./furnaces.component.css']
})
export class FurnacesComponent implements OnInit {
  @Input()
  selectedTool: string;

  constructor(private calculatorService: CalculatorService) { }

  ngOnInit() {

  }
  
  showTool(str: string) {
    this.calculatorService.selectedTool.next(str);
    this.calculatorService.selectedToolType.next('furnaces');
  }
}
