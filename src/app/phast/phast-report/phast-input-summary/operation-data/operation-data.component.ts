import { Component, OnInit, Input, ViewChild, ElementRef, inject, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../../shared/feature-flag.service';
import { PHAST } from "../../../../shared/models/phast/phast";
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-operation-data',
    templateUrl: './operation-data.component.html',
    styleUrls: ['./operation-data.component.css'],
    standalone: false
})
export class OperationDataComponent implements OnInit {
  private featureFlagService = inject(FeatureFlagService);
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  collapse: boolean = true;
  
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor() { }

  ngOnInit() {

  }
  toggleCollapse() {
    this.collapse = !this.collapse;
  }
  
  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
  
}
