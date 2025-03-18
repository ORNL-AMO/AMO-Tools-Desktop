import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { DashboardService } from '../dashboard.service';

@Component({
    selector: 'app-drag-bar',
    templateUrl: './drag-bar.component.html',
    styleUrls: ['./drag-bar.component.css'],
    standalone: false
})
export class DragBarComponent implements OnInit {

  @ViewChild('dragBar', { static: false }) public dragBar: ElementRef;

  @HostListener('drag', ['$event'])
  onDrag(event: DragEvent) {
    if (event.pageX > 150 && event.pageX < 500) {
      this.dashboardService.sidebarX.next(event.pageX);
    }
  }

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let sidebarXValue: number = this.dashboardService.sidebarX.getValue();
    // if (sidebarXValue == undefined && this.dragBar != undefined) {
    //   this.dashboardService.sidebarX.next(this.dragBar.nativeElement.offsetLeft);
    // }
  }

}
