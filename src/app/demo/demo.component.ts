import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../electron.service';
@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.css']
})
export class DemoComponent implements OnInit {

  constructor(private electronService: ElectronService) { }

  ngOnInit() {
  }

  toggle(){
    this.electronService.toggleDevTools();
  }

  close(){
    this.electronService.closeWindow();
  }

  showDialog(){
    this.electronService.logDialog();
  }

}
