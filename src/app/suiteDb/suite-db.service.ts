import { Injectable } from '@angular/core';

declare var db: any;


@Injectable()
export class SuiteDbService {

  constructor() { }

  startup() {
    return db.startup();
  }

  selectFlueGasMaterialGas() {
    return db.selectFlueGasMaterialGas()
  }
}
