import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CalculatorService } from '../calculator.service';

@Component({
  selector: 'app-steam',
  templateUrl: './steam.component.html',
  styleUrls: ['./steam.component.css']
})
export class SteamComponent implements OnInit {
  @Input()
  selectedTool: string;

  constructor(private calculatorService: CalculatorService) { }

  ngOnInit() {

  }
  
  showTool(str: string) {
    this.calculatorService.selectedTool.next(str);
    this.calculatorService.selectedToolType.next('steam');
  }

}
