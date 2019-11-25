import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class DashboardService {

  constructor(private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe(val => {
      console.log(val);
    })
   }
}
