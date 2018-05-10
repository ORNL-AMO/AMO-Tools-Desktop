import { Component, Input, OnInit, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Settings } from "../../../shared/models/settings";
import { SettingsService } from "../../../settings/settings.service";
import { ConvertUnitsService } from "../../../shared/convert-units/convert-units.service";
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { WindowRefService } from '../../../indexedDb/window-ref.service';


@Component({
  selector: 'app-steam-properties',
  templateUrl: './steam-properties.component.html',
  styleUrls: ['./steam-properties.component.css']
})
export class SteamPropertiesComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('lineChartContainer') lineChartContainer: ElementRef;
  chartContainerHeight: number;
  chartContainerWidth: number;

  steamPropertiesForm: FormGroup;
  tabSelect = 'results';

  constructor(private formBuilder: FormBuilder, private settingsDbService: SettingsDbService, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.steamPropertiesForm = this.formBuilder.group({
      'pressure': [0, Validators.required],
      'thermodynamicQuantity': [0, Validators.required],
      'quantityValue': [0, Validators.required]
    });

    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }


    this.chartContainerHeight = 800;
    // this.chartContainerWidth = this.getChartWidth();
  }


  setTab(str: string) {
    this.tabSelect = str;
  }

  getChartWidth(): number {
    if (this.lineChartContainer) {
      // this.changeDetectorRef.detectChanges();
      return this.lineChartContainer.nativeElement.clientWidth;
    }
    else {
      return 0;
    }
  }

  getChartHeight(): number {
    if (this.lineChartContainer) {
      return this.lineChartContainer.nativeElement.clientHeight;
    }
    else {
      return 0;
    }
  }


}
