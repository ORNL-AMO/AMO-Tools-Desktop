import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { DashboardService } from '../../dashboard/dashboard.service';


@Component({
    selector: 'app-welcome-screen',
    templateUrl: './welcome-screen.component.html',
    styleUrls: ['./welcome-screen.component.css'],
    standalone: false
})
export class WelcomeScreenComponent implements OnInit {
  @Output('emitClose')
  emitClose: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  showWelcomeScreen: boolean = false;
  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.showWelcomeScreen = true;
    }, 500)
  }


  closePopUp() {
    this.showWelcomeScreen = false;
    setTimeout(() => {
      this.emitClose.emit(true);
    }, 1500)
  }

  getScreenWidth(): number {
    return this.dashboardService.totalScreenWidth.getValue();
  }

}
