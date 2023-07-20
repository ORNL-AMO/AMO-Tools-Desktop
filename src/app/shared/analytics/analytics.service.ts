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

  async initAnalyticsSession(path: string) {
    await this.setClientAnalyticsId();
    let measurOpenEvent: GAEvent = {
      name: 'measur_app_open',
      params: {
        measur_platform: 'measur-desktop',
        session_id: this.analyticsSessionId,
        // engagement_time_msec required to begin an analytics session but not used again
        engagement_time_msec: '100',
      }
    };
    this.postEventToMeasurementProtocol(measurOpenEvent);
    if (path) {
      this.sendAnalyticsPageView(path);
    }
  }

  async sendAnalyticsPageView(path: string) {
    if (!this.clientId) {
      await this.initAnalyticsSession(path);
    } else {
      let pageViewEvent: GAEvent = {
        name: 'page_view',
        params: {
          measur_platform: 'measur-desktop',
          page_path: path,
          session_id: this.analyticsSessionId
        }
      }
      this.postEventToMeasurementProtocol(pageViewEvent)
    }
  }

  postEventToMeasurementProtocol(gaEvent: GAEvent) {
    if (gaEvent.name === 'page_view') {
      this.setPageViewEventUrl(gaEvent);
    }
      
    let callDebuggingEndpoint = environment.production ? false : true;
    let postBody = {
      isDebugging: callDebuggingEndpoint,
      analyticsPayload: {
        client_id: this.clientId,
        non_personalized_ads: true,
        events: [
          gaEvent
        ]
      }
    }

    let url: string = environment.measurUtilitiesApi + 'gamp';
    if (environment.production) { 
      this.httpClient.post<any>(url, postBody, this.httpOptions)
      .pipe(catchError(error => [])).subscribe({
        next: (resp) => {
          // GA Debugging endpoint returns response
          // GA prod endpoint returns null on success
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
    pageViewEvent.params.page_path = this.getPageWithoutId(pageViewEvent.params.page_path);
    // Never send real paths while in dev
    if (!environment.production) {
      pageViewEvent.params.page_path = '/testing'
    }
  }

  getPageWithoutId(pagePath: string) {
    let pathWithoutId: string = pagePath.replace(/[0-9]/g, '');
    pathWithoutId = pathWithoutId.replace(/\/$/, "");
    if (pathWithoutId.includes('inventory')) {
      pathWithoutId = pathWithoutId.replace('//', "/");
    }
    return pathWithoutId;
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
  measur_platform?: MeasurPlatformString,
  session_id: string,
  engagement_time_msec?: string,
}

export type AnalyticsEventString = 'page_view' | 'measur_app_open';
export type MeasurPlatformString = 'measur-desktop' | 'measur-web';

export interface AppAnalyticsData {
  clientId: string,
  modifiedDate: Date
}