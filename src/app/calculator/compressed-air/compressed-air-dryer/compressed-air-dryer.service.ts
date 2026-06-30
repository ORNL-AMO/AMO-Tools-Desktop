import { Injectable, inject } from '@angular/core';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';

@Injectable()
export class CompressedAirDryerService {
    //convertservice
    private readonly standaloneService = inject(StandaloneService);
    //formService

    settings: Settings;

    //waiting for meeetings and direction.
}