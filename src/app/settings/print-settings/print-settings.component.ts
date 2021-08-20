import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PrintOptions } from '../../shared/models/printing';
import { PrintOptionsMenuService } from '../../shared/print-options-menu/print-options-menu.service';

@Component({
  selector: 'app-print-settings',
  templateUrl: './print-settings.component.html',
  styleUrls: ['./print-settings.component.css']
})
export class PrintSettingsComponent implements OnInit {

  printOptions: PrintOptions;
  printOptionsSub: Subscription;

  constructor(private printOptionsMenuService: PrintOptionsMenuService) { }

  ngOnInit() {
    this.printOptionsSub = this.printOptionsMenuService.printOptions.subscribe(val => {
      this.printOptions = val;
    });
  }

  ngOnDestroy() {
    this.printOptionsSub.unsubscribe();
  }

  togglePrint(option: string) {
    //this.printPsatRollup = !this.printPsatRollup;
    this.printOptionsMenuService.toggleSection(option);
  }

}
