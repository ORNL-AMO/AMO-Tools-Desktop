import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { MotorInventoryService } from '../motor-inventory.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-motor-inventory-setup',
  templateUrl: './motor-inventory-setup.component.html',
  styleUrls: ['./motor-inventory-setup.component.css']
})
export class MotorInventorySetupComponent implements OnInit {
  @Input()
  settings: Settings;

  setupTab: string;
  setupTabSubscription: Subscription;
  tabSelect: string = 'department-catalog';
  modalOpenSub: Subscription;
  isModalOpen: boolean;
  constructor(private motorInventoryService: MotorInventoryService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.setupTabSubscription = this.motorInventoryService.setupTab.subscribe(val => {
      this.setupTab = val;
    });
    this.modalOpenSub = this.motorInventoryService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
      this.cd.detectChanges();
    })
  }

  ngOnDestroy() {
    this.setupTabSubscription.unsubscribe();
    this.modalOpenSub.unsubscribe();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
}
