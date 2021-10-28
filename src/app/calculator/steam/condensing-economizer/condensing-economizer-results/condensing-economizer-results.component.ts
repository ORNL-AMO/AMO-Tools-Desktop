import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CondensingEconomizerOutput } from '../../../../shared/models/steam/condensingEconomizer';
import { CondensingEconomizerService } from '../condensing-economizer.service';

@Component({
  selector: 'app-condensing-economizer-results',
  templateUrl: './condensing-economizer-results.component.html',
  styleUrls: ['./condensing-economizer-results.component.css']
})
export class CondensingEconomizerResultsComponent implements OnInit {
  @Input()
  settings: Settings;
  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;

  outputSubscription: Subscription;
  output: CondensingEconomizerOutput;

  constructor(private condensingEconomizerService: CondensingEconomizerService) { }

  ngOnInit(): void {
    this.outputSubscription = this.condensingEconomizerService.condensingEconomizerOutput.subscribe(val => {
      this.output = val;
      console.log(this.output);
    })
  }

  ngOnDestroy() {
    this.outputSubscription.unsubscribe();
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }


}