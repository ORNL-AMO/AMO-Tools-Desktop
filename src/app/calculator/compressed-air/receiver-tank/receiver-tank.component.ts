import { Component, OnInit, HostListener, ViewChild, ElementRef, Input } from '@angular/core';
import { CompressedAirService } from '../compressed-air.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-receiver-tank',
  templateUrl: './receiver-tank.component.html',
  styleUrls: ['./receiver-tank.component.css']
})
export class ReceiverTankComponent implements OnInit {
  @Input()
  settings: Settings;
  
  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;
  
  methods: Array<{name: string, value: number}> = [
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
  constructor(private compressedAirService: CompressedAirService) {
  }

  ngOnInit() {
    this.method = this.compressedAirService.recieverTankMethod;
  }
  ngOnDestroy(){
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

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setCurrentForm(){
    if(this.method == 0){
      this.currentForm = 'general-method';
    }else if(this.method == 1){
      this.currentForm = 'dedicated-storage';
    }else if(this.method == 2){
      this.currentForm = 'metered-storage';
    }else if(this.method == 3){
      this.currentForm = 'delay-method';
    }else{
      this.currentForm = 'air-capacity';
    }
  }
}
