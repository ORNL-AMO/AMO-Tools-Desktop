import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { MotorInventoryService } from './motor-inventory.service';
import { Subscription } from 'rxjs';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { IndexedDbService } from '../indexedDb/indexed-db.service';
import { Assessment } from '../shared/models/assessment';
import { MotorInventoryData } from './motor-inventory';
import { Settings } from '../shared/models/settings';
import { SettingsDbService } from '../indexedDb/settings-db.service';

declare const packageJson;

@Component({
  selector: 'app-motor-inventory',
  templateUrl: './motor-inventory.component.html',
  styleUrls: ['./motor-inventory.component.css']
})
export class MotorInventoryComponent implements OnInit {
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  containerHeight: number;

  setupTabSub: Subscription;
  mainTab: string;
  mainTabSub: Subscription;

  motorInventoryDataSub: Subscription;
  // motorInventoryAssessment: Assessment;
  settings: Settings;
  constructor(private motorInventoryService: MotorInventoryService, private assessmentDbService: AssessmentDbService,
    private indexedDbService: IndexedDbService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.settings = this.settingsDbService.globalSettings;
    this.setMotorInventoryAssessment();
    // if (this.motorInventoryAssessment) {
    //   // this.motorInventoryService.motorInventoryData.next(this.motorInventoryAssessment.motorInventory);
    // }
    
    this.mainTabSub = this.motorInventoryService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });
    this.setupTabSub = this.motorInventoryService.setupTab.subscribe(val => {
      this.getContainerHeight();

    });


    this.motorInventoryDataSub = this.motorInventoryService.motorInventoryData.subscribe(data => {
      this.saveDbData(data);
    });

  }

  ngOnDestroy() {
    this.setupTabSub.unsubscribe();
    this.mainTabSub.unsubscribe();
    this.motorInventoryDataSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.getContainerHeight();
  }

  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        let footerHeight = 0;
        if(this.footer){
          footerHeight = this.footer.nativeElement.clientHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
      }, 100);
    }
  }

  setMotorInventoryAssessment() {
    // this.motorInventoryAssessment = this.assessmentDbService.getByDirectoryId(1).find(assessment => { return assessment.motorInventory != undefined });
  }

  saveDbData(inventoryData: MotorInventoryData) {
    // if (this.motorInventoryAssessment) {
    //   this.motorInventoryAssessment.motorInventory = inventoryData;
    //   this.indexedDbService.putAssessment(this.motorInventoryAssessment).then(results => {
    //     this.assessmentDbService.setAll().then(() => {
    //     });
    //   });
    // } else {
    //   let newAssessment: Assessment = {
    //     name: null,
    //     createdDate: new Date(),
    //     modifiedDate: new Date(),
    //     type: 'motorInventory',
    //     appVersion: packageJson.version,
    //     motorInventory: inventoryData,
    //     directoryId: 1
    //   };
    //   this.indexedDbService.addAssessment(newAssessment).then(assessmentId => {
    //     this.assessmentDbService.setAll().then(() => {
    //       this.setMotorInventoryAssessment();
    //     });
    //   });
    // }
  }

  // resetData() {
  //   this.indexedDbService.deleteAssessment(this.motorInventoryAssessment.id).then(results => {
  //     this.assessmentDbService.setAll().then(() => {
  //       this.motorInventoryAssessment = undefined;
  //       let inventoryData: MotorInventoryData = this.motorInventoryService.initInventoryData();
  //       this.motorInventoryService.motorInventoryData.next(inventoryData);
  //     })
  //   })
  // }
}
