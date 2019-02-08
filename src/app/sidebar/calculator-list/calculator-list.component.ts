import { Component, OnInit } from '@angular/core';
import { CalculatorService } from '../../calculator/calculator.service';
import { AssessmentService } from '../../assessment/assessment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calculator-list',
  templateUrl: './calculator-list.component.html',
  styleUrls: ['./calculator-list.component.css']
})
export class CalculatorListComponent implements OnInit {

  selectedCalcTypeSub: Subscription;
  selectedCalculatorType: string;
  selectedCalcSub: Subscription;
  selectedCalculator: string;
  constructor(private calculatorService: CalculatorService, private assessmentService: AssessmentService) { }

  ngOnInit() {
    this.selectedCalcTypeSub = this.calculatorService.selectedToolType.subscribe(calcType => {
      this.selectedCalculatorType = calcType;
    })

    this.selectedCalcSub = this.calculatorService.selectedTool.subscribe(calculator => {
      this.selectedCalculator = calculator;
    })
  }

  ngOnDestroy(){
    this.selectedCalcSub.unsubscribe();
    this.selectedCalcTypeSub.unsubscribe();
  }


  chooseCalculator(str: string) {
    this.assessmentService.dashboardView.next('calculator');
    this.calculatorService.selectedToolType.next(str);
    this.calculatorService.selectedTool.next('none');
  }

  selectCalculator(str: string){
    this.calculatorService.selectedTool.next(str);
  }
}
