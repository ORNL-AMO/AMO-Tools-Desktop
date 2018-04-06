import { Injectable } from '@angular/core';
import { SteamPropertiesInput, SteamPropertiesOutput } from "../../shared/models/steam";

declare var steamAddon: any;

@Injectable()
export class SteamService {

  static steamProperties(steamPropertiesInput: SteamPropertiesInput): SteamPropertiesOutput {
    return steamAddon.steamProperties(steamPropertiesInput);
  }

  constructor() { }

}
