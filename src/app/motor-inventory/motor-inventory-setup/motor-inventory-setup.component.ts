import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MotorInventoryService } from '../motor-inventory.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-motor-inventory-setup',
  templateUrl: './motor-inventory-setup.component.html',
  styleUrls: ['./motor-inventory-setup.component.css']
})
export class MotorInventorySetupComponent implements OnInit {

  setupTab: string;
  setupTabSubscription: Subscription;
  tabSelect: string = 'help';
  constructor(private motorInventoryService: MotorInventoryService) { }

  ngOnInit(): void {
    this.setupTabSubscription = this.motorInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
    });
  }

  ngOnDestroy(){
    this.setupTabSubscription.unsubscribe();
  }

  setTab(str: string){
    this.tabSelect = str;
  }
}
