import { Component, OnInit } from '@angular/core';
import { FanPsychrometricService } from '../fan-psychrometric.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fan-psychrometric-help',
  templateUrl: './fan-psychrometric-help.component.html',
  styleUrls: ['./fan-psychrometric-help.component.css']
})
export class FanPsychrometricHelpComponent implements OnInit {

  constructor(private fanPsychrometricService: FanPsychrometricService) { }

  currentField: string;
  currentFieldSub: Subscription;
  
  ngOnInit(): void {
    this.currentFieldSub = this.fanPsychrometricService.currentField.subscribe(value => {
      this.currentField = value;
    })
  }

  ngOnDestroy() {
    this.currentFieldSub.unsubscribe();
  }

}
