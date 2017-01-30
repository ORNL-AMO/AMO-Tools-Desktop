import { Component } from '@angular/core';
import { ElectronService } from './electron.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';

  constructor(private _electronService: ElectronService){

  }

  toggleTools(){
    this._electronService.toggleDevTools();
  }
}
