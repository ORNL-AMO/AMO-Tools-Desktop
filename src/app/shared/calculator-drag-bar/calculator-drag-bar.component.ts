import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
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
    if (event.pageX > 50 && event.pageX < 1000) {
      this.calculatorDragBarService.sidebarX.next(event.pageX);
    }
    //this.setSidebarX(event.pageX);
    this.dragAction = event.pageX;
  }

  dragAction: number;

  constructor(private calculatorDragBarService: CalculatorDragBarService) { }

  ngOnInit() {
  }

  setSidebarX(pageX: number){
    let dashboardSidebarX: number = this.calculatorDragBarService.sidebarX.getValue();
    let offsetPageX: number = pageX - dashboardSidebarX;
    //adjust these values to make more sense with a calculator form
    if (offsetPageX > 50 && offsetPageX < 2000) {
      this.calculatorDragBarService.sidebarX.next(offsetPageX);
    }
  }

  ngAfterViewInit() {
    // let sidebarXValue: number = this.calculatorDragBarService.sidebarX.getValue();
    // if (sidebarXValue == undefined && this.dragBar != undefined) {
    //   this.calculatorDragBarService.sidebarX.next(this.dragBar.nativeElement.offsetLeft);
    // }
    let dashboardSidebarX: number = this.calculatorDragBarService.sidebarX.getValue();
    let offsetPageX: number = this.dragAction - dashboardSidebarX;
    //adjust these values to make more sense with a calculator form
    if (offsetPageX > 500 && offsetPageX < 1000) {
      this.calculatorDragBarService.sidebarX.next(this.dragBar.nativeElement);
    }
  }

}
