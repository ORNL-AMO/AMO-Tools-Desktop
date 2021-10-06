import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DashboardService } from '../../../../dashboard/dashboard.service';
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
    this.setSidebarX(event.pageX);
  }

  constructor(private chillerStagingService: ChillerStagingService, private dashboardService: DashboardService) { }

  ngOnInit() {
  }

  setSidebarX(pageX: number){
    let dashboardSidebarX: number = this.dashboardService.sidebarX.getValue();
    let offsetPageX: number = pageX - dashboardSidebarX;
    //adjust these values to make more sense with a calculator form
    if (offsetPageX > 500 && offsetPageX < 1000) {
      this.chillerStagingService.sidebarX.next(offsetPageX);
    }
  }

}
