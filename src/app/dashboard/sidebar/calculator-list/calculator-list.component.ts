import { ChangeDetectorRef, Component, ElementRef, inject, OnDestroy, Signal } from '@angular/core';
import { FeatureFlagService } from '../../../shared/feature-flag.service';

@Component({
    selector: 'app-calculator-list',
    templateUrl: './calculator-list.component.html',
    styleUrls: ['./calculator-list.component.css'],
    standalone: false
})
export class CalculatorListComponent implements OnDestroy {
  private featureFlagService = inject(FeatureFlagService);
  private cd = inject(ChangeDetectorRef);
  private el = inject(ElementRef);
  showOperationalImpacts: Signal<boolean> = this.featureFlagService.showOperationalImpacts;

  mainFlyoutActive = false;
  activeCategory: string | null = null;
  mainFlyoutTop = 0;
  mainFlyoutLeft = 0;
  catFlyoutTop = 0;
  catFlyoutLeft = 0;
  private mainHideTimer: ReturnType<typeof setTimeout> | null = null;
  private catHideTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy() {
    if (this.mainHideTimer) clearTimeout(this.mainHideTimer);
    if (this.catHideTimer) clearTimeout(this.catHideTimer);
  }

  onMainEnter(event: MouseEvent) {
    this.clearMainHideTimer();
    const trigger = event.currentTarget as HTMLElement;
    const rect = trigger.getBoundingClientRect();
    this.mainFlyoutTop = rect.top;
    this.mainFlyoutLeft = rect.right;
    if (!this.mainFlyoutActive) {
      this.mainFlyoutActive = true;
      this.cd.detectChanges();
      this.clampFlyoutMain();
    }
  }

  onMainLeave() {
    this.clearMainHideTimer();
    this.mainHideTimer = setTimeout(() => {
      this.mainFlyoutActive = false;
      this.activeCategory = null;
      this.cd.markForCheck();
    }, 300);
  }

  onMainFocusIn(event: FocusEvent) {
    this.clearMainHideTimer();
    if (this.mainFlyoutActive) return;
    const trigger = event.currentTarget as HTMLElement;
    const rect = trigger.getBoundingClientRect();
    this.mainFlyoutTop = rect.top;
    this.mainFlyoutLeft = rect.right;
    this.mainFlyoutActive = true;
    this.cd.detectChanges();
    this.clampFlyoutMain();
  }

  onMainFocusOut(event: FocusEvent) {
    const group = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as Node | null;
    if (!relatedTarget || !group.contains(relatedTarget)) {
      this.clearMainHideTimer();
      this.mainHideTimer = setTimeout(() => {
        this.mainFlyoutActive = false;
        this.activeCategory = null;
        this.cd.markForCheck();
      }, 300);
    }
  }

  onMainFlyoutEnter() {
    this.clearMainHideTimer();
  }

  onMainFlyoutLeave() {
    this.clearMainHideTimer();
    this.mainHideTimer = setTimeout(() => {
      this.mainFlyoutActive = false;
      this.activeCategory = null;
      this.cd.markForCheck();
    }, 300);
  }

  onCatEnter(category: string, event: MouseEvent) {
    this.clearCatHideTimer();
    const trigger = event.currentTarget as HTMLElement;
    const rect = trigger.getBoundingClientRect();
    this.catFlyoutTop = rect.top;
    this.catFlyoutLeft = rect.right;
    this.activeCategory = category;
    this.cd.detectChanges();
    this.clampFlyoutCat();
  }

  onCatLeave() {
    this.clearCatHideTimer();
    this.catHideTimer = setTimeout(() => {
      this.activeCategory = null;
      this.cd.markForCheck();
    }, 300);
  }

  onCatFlyoutEnter() {
    this.clearMainHideTimer();
    this.clearCatHideTimer();
  }

  onCatFlyoutLeave() {
    this.clearCatHideTimer();
    this.catHideTimer = setTimeout(() => {
      this.activeCategory = null;
      this.cd.markForCheck();
    }, 300);
    this.clearMainHideTimer();
    this.mainHideTimer = setTimeout(() => {
      this.mainFlyoutActive = false;
      this.cd.markForCheck();
    }, 300);
  }

  onCatFocusIn(category: string, event: FocusEvent) {
    this.clearCatHideTimer();
    if (this.activeCategory === category) return;
    const group = event.currentTarget as HTMLElement;
    const rect = group.getBoundingClientRect();
    this.catFlyoutTop = rect.top;
    this.catFlyoutLeft = rect.right;
    this.activeCategory = category;
    this.cd.detectChanges();
    this.clampFlyoutCat();
  }

  onCatFocusOut(event: FocusEvent) {
    const group = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as Node | null;
    if (!relatedTarget || !group.contains(relatedTarget)) {
      this.clearCatHideTimer();
      this.catHideTimer = setTimeout(() => { this.activeCategory = null; this.cd.markForCheck(); }, 300);
    }
  }

  onEscapeKey() {
    this.mainFlyoutActive = false;
    this.activeCategory = null;
  }

  private clearMainHideTimer() {
    if (this.mainHideTimer) { clearTimeout(this.mainHideTimer); this.mainHideTimer = null; }
  }

  private clearCatHideTimer() {
    if (this.catHideTimer) { clearTimeout(this.catHideTimer); this.catHideTimer = null; }
  }

  private clampFlyoutMain() {
    const flyout = this.el.nativeElement.querySelector('.calc-flyout-main') as HTMLElement;
    if (!flyout) return;
    const pad = 8;
    const maxTop = window.innerHeight - flyout.offsetHeight - pad;
    if (this.mainFlyoutTop > maxTop) this.mainFlyoutTop = Math.max(pad, maxTop);
  }

  private clampFlyoutCat() {
    const flyout = this.el.nativeElement.querySelector('.calc-flyout-cat') as HTMLElement;
    if (!flyout) return;
    const pad = 8;
    const maxTop = window.innerHeight - flyout.offsetHeight - pad;
    if (this.catFlyoutTop > maxTop) this.catFlyoutTop = Math.max(pad, maxTop);
  }
}
