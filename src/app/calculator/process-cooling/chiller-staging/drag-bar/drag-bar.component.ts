import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CalculatorService } from '../../../calculator.service';
import { ChillerStagingService } from '../chiller-staging.service';

@Component({
  selector: 'app-drag-bar',
  templateUrl: './drag-bar.component.html',
  styleUrls: ['./drag-bar.component.css']
})
export class DragBarComponent implements OnInit {

  @ViewChild('dragBar', { static: false }) public dragBar: ElementRef;

  @HostListener('drag', ['$event'])
  onDrag(event: DragEvent) {
    if (event.pageX > 500 && event.pageX < 1000) {
      this.chillerStagingService.sidebarX.next(event.pageX);
    }
  }

  constructor(private chillerStagingService: ChillerStagingService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let sidebarXValue: number = this.chillerStagingService.sidebarX.getValue();
    if (sidebarXValue == undefined && this.dragBar != undefined) {
      this.chillerStagingService.sidebarX.next(this.dragBar.nativeElement.offsetLeft);
    }
  }

}
