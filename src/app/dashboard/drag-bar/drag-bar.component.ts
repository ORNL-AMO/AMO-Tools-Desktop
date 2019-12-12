import { Component, OnInit, HostListener } from '@angular/core';
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-drag-bar',
  templateUrl: './drag-bar.component.html',
  styleUrls: ['./drag-bar.component.css']
})
export class DragBarComponent implements OnInit {

  @HostListener('drag', ['$event'])
  onDrag(event: DragEvent) {
    if (event.pageX > 150 && event.pageX < 500) {
      this.dashboardService.sidebarX.next(event.pageX);
    }
  }

  constructor(private dashboardService: DashboardService) { }

  ngOnInit() {
  }

}
