import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CalculatorService } from '../calculator.service';

@Component({
  selector: 'app-compressed-air',
  templateUrl: './compressed-air.component.html',
  styleUrls: ['./compressed-air.component.css']
})
export class CompressedAirComponent implements OnInit {
  @Input()
  selectedTool: string;

  constructor(private calculatorService: CalculatorService) { }

  ngOnInit() {

  }
  
  showTool(str: string) {
    this.calculatorService.selectedTool.next(str);
    this.calculatorService.selectedToolType.next('compressed-air');
  }

}
