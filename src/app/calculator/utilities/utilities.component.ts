import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CalculatorService } from '../calculator.service';


@Component({
  selector: 'app-utilities',
  templateUrl: './utilities.component.html',
  styleUrls: ['./utilities.component.css']
})
export class UtilitiesComponent implements OnInit {
  @Input()
  selectedTool: string;

  constructor(private calculatorService: CalculatorService) { }

  ngOnInit() {

  }

  showTool(str: string) {
    this.calculatorService.selectedTool.next(str);
    this.calculatorService.selectedToolType.next('utilities');
  }

}
