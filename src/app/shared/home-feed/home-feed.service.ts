import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export type FeedItemType = 'survey' | 'releaseNotes' | 'subscribe' | 'info' | 'warning';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  title: string;
  message: string;
  icon: string;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

@Injectable({ providedIn: 'root' })
export class HomeFeedService {
  private _items = new BehaviorSubject<FeedItem[]>([]);
  items$ = this._items.asObservable();

  openSurveyModal$ = new Subject<void>();
  openSubscribeModal$ = new Subject<void>();

  add(item: FeedItem): void {
    if (!this._items.value.find(n => n.id === item.id)) {
      this._items.next([...this._items.value, item]);
    }
  }

  dismiss(id: string): void {
    this._items.next(this._items.value.filter(n => n.id !== id));
  }

  addSurveyItem(): void {
    this.add({
      id: 'survey',
      type: 'survey',
      title: 'Share Your Experience',
      message: 'Help us improve MEASUR by taking a short survey about your experience.',
      icon: 'fa-star',
      primaryActionLabel: 'Take Survey',
      secondaryActionLabel: 'Dismiss'
    });
  }

  addSubscribeItem(): void {
    this.add({
      id: 'subscribe',
      type: 'subscribe',
      title: 'Stay Up to Date',
      message: 'Subscribe for MEASUR news on releases, webinars, and training events.',
      icon: 'fa-envelope',
      primaryActionLabel: 'Subscribe',
      secondaryActionLabel: 'Dismiss'
    });
  }

  /** DEV ONLY — seed one of every notification type for visual testing. Remove call site when done. */
  loadTestNotifications(): void {
    this.add({
      id: 'releaseNotes-test',
      type: 'releaseNotes',
      title: "What's New in v1.7.3",
      message: 'See the latest improvements, features, and fixes in this release.',
      icon: 'fa-gift',
      primaryActionLabel: 'View Release Notes'
    });
    this.addSubscribeItem();
    this.addSurveyItem();
    this.add({
      id: 'info-test',
      type: 'info',
      title: 'Tip: Backup Your Data',
      message: 'Export a backup of your assessments regularly to avoid data loss.',
      icon: 'fa-info-circle',
      primaryActionLabel: 'Go to Settings'
    });
    this.add({
      id: 'warning-test',
      type: 'warning',
      title: 'Storage Warning',
      message: 'Local storage access is limited in this environment. Some features may be affected.',
      icon: 'fa-exclamation-triangle',
      primaryActionLabel: 'Learn More',
      secondaryActionLabel: 'Dismiss'
    });
  }

  triggerSurvey(): void {
    this.openSurveyModal$.next();
    this.dismiss('survey');
  }

  triggerSubscribe(): void {
    this.openSubscribeModal$.next();
    this.dismiss('subscribe');
  }
}
