import { Injectable } from '@angular/core';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AnalyticsDataIdbService } from '../../indexedDb/analytics-data-idb.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AnalyticsService {

  private clientId: string;
  analyticsSessionId: string;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
    })
  };

  constructor(private httpClient: HttpClient, private analyticsDataIdbService: AnalyticsDataIdbService) {
   this.analyticsSessionId = uuidv4();
  }

  async initAnalyticsSession() {
    await this.setClientAnalyticsId();
    this.sendAnalyticsPageView('/landing-screen', '100');
  }

  async setClientAnalyticsId() {
    let appAnalyticsData: Array<AppAnalyticsData> = await firstValueFrom(this.analyticsDataIdbService.getAppAnalyticsData());
    let clientId: string;
    if (appAnalyticsData.length == 0) {
      clientId = uuidv4();
      await firstValueFrom(this.analyticsDataIdbService.addWithObservable({
        clientId: clientId,
        modifiedDate: new Date()
      }));
    } else {
      clientId = appAnalyticsData[0].clientId;
    }
    this.setClientId(clientId);
  }
  
  sendAnalyticsPageView(path: string, engagementTimeMsec?: string) {
    let pageViewEvent: GAEvent = {
      name:'page_view', 
      params: { 
        measur_platform: 'desktop',
        page_path: path, 
        // engagement_time_msec required to begin an analytics session but not used again
        engagement_time_msec: engagementTimeMsec,
        session_id: this.analyticsSessionId 
      }}
    this.postEventToMeasurementProtocol(pageViewEvent)
  }

  postEventToMeasurementProtocol(event: GAEvent) {
    if (event.name === 'page_view') {
      this.setPageViewEventUrl(event);
    }
      
    let callDebuggingEndpoint = environment.production ? false : true;
    let postBody = {
      isDebugging: callDebuggingEndpoint,
      analyticsPayload: {
        client_id: this.clientId,
        non_personalized_ads: true,
        events: [
          event,
        ]
      }
    }

    let url: string = environment.measurUtilitiesApi + 'gamp';
    if (environment.production) {
      this.httpClient.post<any>(url, postBody, this.httpOptions)
      .pipe(catchError(error => [])).subscribe({
        next: (resp) => {
          // only GA debugging endpoint returns a response
          console.log(resp);
        },
        error: (error: AnalyticsHttpError) => {
          // for now all errors fail silently
        }
      });
    }
  }

  setClientId(uuid: string) {
    this.clientId = uuid;
  }

  setPageViewEventUrl(pageViewEvent: GAEvent) {
      if (!pageViewEvent.params.page_path.includes('inventory')) {
        let pathWithoutId: string = pageViewEvent.params.page_path.replace(/[0-9]/g, '');
        pathWithoutId = pathWithoutId.replace(/\/$/, "");
        pageViewEvent.params.page_path = pathWithoutId;
      }
      // Never send real paths while in dev
      if (!environment.production) { 
        pageViewEvent.params.page_path = '/testing'
      } 
  }

}

export class AnalyticsHttpError extends Error {}

export interface AnalyticsPayload {
  client_id: string,
  user_id?: string,
  non_personalized_ads: boolean,
  events: Array<{name: string, params: object}>
}

export interface GAEvent {
  name: AnalyticsEventString, 
  params: EventParameters
}

export interface EventParameters {
  page_path?: string,
  measur_platform?: string,
  session_id?: string,
  engagement_time_msec?: string,
}

export type AnalyticsEventString = 'page_view';
export type MeasurPlatformString = 'desktop' | 'web';

export interface AppAnalyticsData {
  clientId: string,
  modifiedDate: Date
}