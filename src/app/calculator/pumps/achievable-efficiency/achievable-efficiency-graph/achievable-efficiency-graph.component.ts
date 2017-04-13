import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PsatService } from '../../../../psat/psat.service';
@Component({
  selector: 'app-achievable-efficiency-graph',
  templateUrl: './achievable-efficiency-graph.component.html',
  styleUrls: ['./achievable-efficiency-graph.component.css']
})
export class AchievableEfficiencyGraphComponent implements OnInit {
  @Input()
  efficiencyForm: any;
  // @Input()
  // toggleCalculate: boolean;

  firstChange: boolean = true;

  results: any = {
    max: 0,
    average: 0
  }
  constructor(private psatService: PsatService) { }

  ngOnInit() {
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.toggleCalculate) {
  //     this.drawGraph();
  //   }
  // }

  calculateYaverage(flow: number) {
    if (this.checkForm()) {
      let tmpResults = this.psatService.pumpEfficiency(
        this.efficiencyForm.value.pumpType,
        flow
      );
      return tmpResults.average;
    } else { return 0 }
  }

  calculateYmax(flow: number) {
    if (this.checkForm()) {
      let tmpResults = this.psatService.pumpEfficiency(
        this.efficiencyForm.value.pumpType,
        flow
      );
      return tmpResults.max;
    } else { return 0 }
  }

  drawGraph() {
    if (this.checkForm()) {
      this.results.max = this.calculateYmax(this.efficiencyForm.value.flowRate);
      this.results.average = this.calculateYaverage(this.efficiencyForm.value.flowRate);
    }
  }

  checkForm() {
    if (
      this.efficiencyForm.controls.pumpType.status == 'VALID' &&
      this.efficiencyForm.controls.flowRate.status == 'VALID'
    ) {
      return true;
    } else {
      return false;
    }
  }
}
