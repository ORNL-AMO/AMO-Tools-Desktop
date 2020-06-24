import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MotorInventoryService } from '../motor-inventory.service';

@Component({
  selector: 'app-motor-inventory-banner',
  templateUrl: './motor-inventory-banner.component.html',
  styleUrls: ['./motor-inventory-banner.component.css']
})
export class MotorInventoryBannerComponent implements OnInit {

  setupTab: string;
  setupTabSub: Subscription;
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.setupTabSub = this.motorInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
    });
  }

  ngOnDestroy(){
    this.setupTabSub.unsubscribe();
  }

  setSetupTab(str: string){
    this.motorInventoryService.setupTab.next(str);
  }
}
