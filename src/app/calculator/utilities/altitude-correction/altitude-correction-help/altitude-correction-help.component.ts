import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AltitudeCorrectionService } from '../altitude-correction.service';

@Component({
    selector: 'app-altitude-correction-help',
    templateUrl: './altitude-correction-help.component.html',
    styleUrls: ['./altitude-correction-help.component.css'],
    standalone: false
})
export class AltitudeCorrectionHelpComponent implements OnInit {

  currentField: string;
  currentFieldSub: Subscription;

  constructor(private altitudeCorrectionService: AltitudeCorrectionService) { }

  ngOnInit() {
    this.currentFieldSub = this.altitudeCorrectionService.currentField.subscribe(value => {
      this.currentField = value;
    });
  }

  ngOnDestroy(){
    this.currentFieldSub.unsubscribe();
  }

}
