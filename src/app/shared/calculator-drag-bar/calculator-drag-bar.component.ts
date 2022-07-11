import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../dashboard/dashboard.service';
import { CalculatorDragBarService } from './calculator-drag-bar.service';

@Component({
  selector: 'app-calculator-drag-bar',
  templateUrl: './calculator-drag-bar.component.html',
  styleUrls: ['./calculator-drag-bar.component.css']
})
export class CalculatorDragBarComponent implements OnInit {

  @ViewChild('dragBar', { static: false }) public dragBar: ElementRef;

  @HostListener('drag', ['$event'])
  onDrag(event: DragEvent) {
    this.setSidebarX(event.pageX);
  }

  constructor(private calculatorDragBarService: CalculatorDragBarService,
     private dashboardService: DashboardService) { }

  ngOnInit() {
  }

  setSidebarX(pageX: number){
    let dashboardSidebarX: number = this.dashboardService.sidebarX.getValue();
    let offsetPageX: number = pageX - dashboardSidebarX;
    if (offsetPageX > 500 && offsetPageX < 1000) {
      this.calculatorDragBarService.sidebarX.next(offsetPageX);
    }
  }


}
