import {Component, OnInit, HostListener, ViewChild, ElementRef, Input} from '@angular/core';
import {CompressedAirService} from '../compressed-air.service';
import {Settings} from '../../../shared/models/settings';
import {GeneralMethodFormComponent} from "./general-method-form/general-method-form.component";
import {DedicatedStorageFormComponent} from "./dedicated-storage-form/dedicated-storage-form.component";
import {MeteredStorageFormComponent} from "./metered-storage-form/metered-storage-form.component";
import {DelayMethodFormComponent} from "./delay-method-form/delay-method-form.component";
import {AirCapacityFormComponent} from "./air-capacity-form/air-capacity-form.component";

@Component({
  selector: 'app-receiver-tank',
  templateUrl: './receiver-tank.component.html',
  styleUrls: ['./receiver-tank.component.css']
})
export class ReceiverTankComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  calcType: string;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;
  @ViewChild(GeneralMethodFormComponent) generalMethodForm: GeneralMethodFormComponent;
  @ViewChild(DedicatedStorageFormComponent) dedicatedStorageForm: DedicatedStorageFormComponent;
  @ViewChild(MeteredStorageFormComponent) meteredStorageForm: MeteredStorageFormComponent;
  @ViewChild(DelayMethodFormComponent) delayMethodForm: DelayMethodFormComponent;
  @ViewChild(AirCapacityFormComponent) airCapacityForm: AirCapacityFormComponent;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  methods: Array<{ name: string, value: number }> = [
    {
      name: 'General',
      value: 0
    },
    {
      name: 'Dedicated Storage',
      value: 1
    },
    {
      name: 'Metered Storage',
      value: 2
    },
    {
      name: 'Bridging Compressor Reaction Delay',
      value: 3
    }
  ];
  method: number;

  currentField: string = 'default';
  currentForm: string;
  toggleResetData: boolean = false;

  constructor(private compressedAirService: CompressedAirService) {
  }

  ngOnInit() {
    this.method = this.compressedAirService.recieverTankMethod;
  }

  ngOnDestroy() {
    this.compressedAirService.recieverTankMethod = this.method;
  }

  changeField(str: string, formStr: string) {
    this.currentField = str;
    this.currentForm = formStr;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  btnResetData() {
    this.toggleResetData = !this.toggleResetData;
    this.method = 0;
    this.setCurrentForm();
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setCurrentForm() {
    if (this.method === 0) {
      this.currentForm = 'general-method';
    } else if (this.method === 1) {
      this.currentForm = 'dedicated-storage';
    } else if (this.method === 2) {
      this.currentForm = 'metered-storage';
    } else if (this.method === 3) {
      this.currentForm = 'delay-method';
    } else {
      this.currentForm = 'air-capacity';
    }
  }

  btnGenerateExample() {
    console.log(this.method);
    if (this.method === 0) {
      this.currentForm = 'general-method';
      let tempInputs = {
        airDemand: 150,
        allowablePressureDrop: 3,
        method: 0,
        atmosphericPressure: 14.7,
      };
      // tempInputs // Put Conversion code here
      this.generalMethodForm.inputs = tempInputs;
      this.generalMethodForm.getStorage();

    } else if (this.method === 1) {
      this.currentForm = 'dedicated-storage';
      let tempInputs = {
        method: 1,
        atmosphericPressure: 14.7,
        lengthOfDemand: 0.8333333,
        airFlowRequirement: 1000,
        initialTankPressure: 110,
        finalTankPressure: 100
      };
      //Conversion Code
      this.dedicatedStorageForm.inputs = tempInputs;
      this.dedicatedStorageForm.getReceiverVolume();

    } else if (this.method === 2) {
      this.currentForm = 'metered-storage';
      let tempInputs = {
        method: 2,
        lengthOfDemand: 1.5,
        airFlowRequirement: 900,
        atmosphericPressure: 14.7,
        initialTankPressure: 100,
        finalTankPressure: 70,
        meteredControl: 45,
      };
      this.meteredStorageForm.inputs = tempInputs;
      this.meteredStorageForm.getTotalReceiverVolume();
    } else if (this.method === 3) {
      this.currentForm = 'delay-method';
      let tempInputs = {
        method: 3,
        distanceToCompressorRoom: 1000,
        speedOfAir: 250,
        airDemand: 600,
        allowablePressureDrop: 2,
        atmosphericPressure: 14.7
      };
      this.delayMethodForm.inputs = tempInputs;
      this.delayMethodForm.getTotalReceiverVolume();
    }
  }

  btnGenerateExample2() {
    let tempInputs = {
      tankSize: 1000,
      airPressureIn: 110,
      airPressureOut: 100,
    };
    this.airCapacityForm.inputs = tempInputs;
    this.airCapacityForm.getAirCapacity();
    this.airCapacityForm.getTankSize();
  }
}
