import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DashboardService {

  updateSidebarData: BehaviorSubject<boolean>;
  constructor(private activatedRoute: ActivatedRoute) {
    this.updateSidebarData = new BehaviorSubject<boolean>(false);
  }
}
