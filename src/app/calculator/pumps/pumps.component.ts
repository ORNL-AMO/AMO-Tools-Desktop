import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CalculatorService } from '../calculator.service';


@Component({
  selector: 'app-pumps',
  templateUrl: './pumps.component.html',
  styleUrls: ['./pumps.component.css']
})
export class PumpsComponent implements OnInit {
  @Input()
  selectedTool: string;

  constructor(private calculatorService: CalculatorService) { }

  ngOnInit() {

  }
  
  showTool(str: string) {
    this.calculatorService.selectedTool.next(str);
    this.calculatorService.selectedToolType.next('pumps');
  }
}
