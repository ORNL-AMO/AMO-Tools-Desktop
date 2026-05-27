import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { AssessmentService } from '../assessment.service';
import { DashboardService } from '../dashboard.service';
import { FeedItem, HomeFeedService } from '../../shared/home-feed/home-feed.service';
import { RecentItem, RecentlyAccessedService } from '../../shared/recently-accessed/recently-accessed.service';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-landing-screen',
    templateUrl: './landing-screen.component.html',
    styleUrls: ['./landing-screen.component.css'],
    standalone: false
})
export class LandingScreenComponent implements OnInit, OnDestroy {
  feedItems: FeedItem[] = [];
  showAllNotifications = false;
  readonly notificationsPageSize = 2;
  recentItems: RecentItem[] = [];
  private feedSub: Subscription;

  constructor(
    private dashboardService: DashboardService,
    private settingsDbService: SettingsDbService,
    private assessmentService: AssessmentService,
    private homeFeedService: HomeFeedService,
    private recentlyAccessedService: RecentlyAccessedService
  ) { }

  ngOnInit() {
    if (!this.settingsDbService.globalSettings.disableTutorial) {
      this.assessmentService.showTutorial.next('landing-screen');
    }
    this.feedSub = this.homeFeedService.items$.subscribe(items => {
      this.feedItems = items;
    });
    this.recentItems = this.recentlyAccessedService.getRecent();

    // TODO: remove before merge — seeds all notification types for visual testing
    if (!environment.production) {
      this.homeFeedService.loadTestNotifications();
    }
  }

  ngOnDestroy() {
    this.feedSub?.unsubscribe();
  }

  get visibleFeedItems(): FeedItem[] {
    return this.showAllNotifications
      ? this.feedItems
      : this.feedItems.slice(0, this.notificationsPageSize);
  }

  get hiddenCount(): number {
    return Math.max(0, this.feedItems.length - this.notificationsPageSize);
  }

  toggleShowAllNotifications(): void {
    this.showAllNotifications = !this.showAllNotifications;
  }

  dismissItem(id: string): void {
    this.homeFeedService.dismiss(id);
  }

  primaryAction(item: FeedItem): void {
    switch (item.id) {
      case 'survey':
        this.homeFeedService.triggerSurvey();
        break;
      case 'subscribe':
        this.homeFeedService.triggerSubscribe();
        break;
    }
  }

  openRecentItem(item: RecentItem): void {
    this.recentlyAccessedService.record(item);
    this.dashboardService.navigateWithSidebarOptions(item.route, { shouldCollapse: true });
  }

  getItemMeta(item: RecentItem) {
    return this.recentlyAccessedService.getItemMeta(item);
  }

  formatTimeAgo(timestamp: number): string {
    return this.recentlyAccessedService.formatTimeAgo(timestamp);
  }

  createAssessment(str?: string) {
    if (str) {
      this.dashboardService.newAssessmentType = str;
    }
    this.dashboardService.createAssessment.next(true);
  }

  createDiagram(str?: string) {
    this.dashboardService.showCreateDiagram.next(true);
  }

  showCreateInventory(inventoryType: string) {
    this.dashboardService.showCreateInventory.next(inventoryType);
  }
}
