import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { WaterDiagramComponent } from './water-diagram.component';
import { WaterProcessDiagramService } from '../water-process-diagram.service';

describe('WaterDiagramComponent loading skeleton', () => {
  let fixture: ComponentFixture<WaterDiagramComponent>;
  let service: WaterProcessDiagramService;
  let component: { isDiagramReady: () => boolean, isSkeletonVisible: () => boolean, onDiagramReady: () => void };

  const hasSkeleton = () => !!fixture.nativeElement.querySelector('.diagram-skeleton');

  const setUp = (hasParentState: boolean) => {
    TestBed.configureTestingModule({
      declarations: [WaterDiagramComponent],
      providers: [WaterProcessDiagramService],
      schemas: [NO_ERRORS_SCHEMA]
    });
    service = TestBed.inject(WaterProcessDiagramService);
    if (hasParentState) {
      service.waterDiagram.next({ flowDiagramData: {} } as never);
      service.parentContainer.next({ height: 500, headerHeight: 0, footerHeight: 0 } as never);
    }
    fixture = TestBed.createComponent(WaterDiagramComponent);
    component = fixture.componentInstance as unknown as typeof component;
    fixture.detectChanges();
  };

  beforeEach(() => {
    jasmine.clock().install();
    setUp(true);
  });

  describe('before the diagram is mounted', () => {
    // * integrated assessments create this component while the diagram tab is still hidden and unmeasured
    beforeEach(() => {
      fixture.destroy();
      TestBed.resetTestingModule();
      setUp(false);
    });

    it('does not run the minimum or failsafe timers until parent state exists', () => {
      jasmine.clock().tick(20000);
      fixture.detectChanges();
      expect(component.isDiagramReady()).toBeFalse();
      expect(component.isSkeletonVisible()).toBeTrue();
    });

    it('starts the timers once the diagram is mounted, so the skeleton still shows for the minimum time', () => {
      jasmine.clock().tick(20000);
      service.waterDiagram.next({ flowDiagramData: {} } as never);
      service.parentContainer.next({ height: 500, headerHeight: 0, footerHeight: 0 } as never);
      fixture.detectChanges();
      component.onDiagramReady();
      jasmine.clock().tick(499);
      expect(component.isSkeletonVisible()).toBeTrue();
      jasmine.clock().tick(2);
      expect(component.isSkeletonVisible()).toBeFalse();
    });
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('shows the skeleton until the diagram reports ready', () => {
    expect(hasSkeleton()).toBeTrue();
    component.onDiagramReady();
    expect(component.isDiagramReady()).toBeTrue();
  });

  it('shows the skeleton again when the diagram is remounted', () => {
    component.onDiagramReady();
    service.remountDiagram();
    fixture.detectChanges();
    expect(component.isDiagramReady()).toBeFalse();
    expect(hasSkeleton()).toBeTrue();
  });

  describe('minimum display time', () => {
    it('keeps the skeleton up until the minimum time passes, even if the diagram is already ready', () => {
      component.onDiagramReady();
      fixture.detectChanges();
      jasmine.clock().tick(499);
      expect(component.isSkeletonVisible()).toBeTrue();
      jasmine.clock().tick(2);
      expect(component.isSkeletonVisible()).toBeFalse();
    });

    it('hides the skeleton as soon as the diagram is ready when the minimum time has already passed', () => {
      jasmine.clock().tick(501);
      fixture.detectChanges();
      expect(component.isSkeletonVisible()).toBeTrue();
      component.onDiagramReady();
      expect(component.isSkeletonVisible()).toBeFalse();
    });

    it('restarts the minimum time on remount', () => {
      component.onDiagramReady();
      fixture.detectChanges();
      jasmine.clock().tick(600);
      expect(component.isSkeletonVisible()).toBeFalse();

      service.remountDiagram();
      fixture.detectChanges();
      component.onDiagramReady();
      fixture.detectChanges();
      jasmine.clock().tick(400);
      expect(component.isSkeletonVisible()).toBeTrue();
      jasmine.clock().tick(101);
      expect(component.isSkeletonVisible()).toBeFalse();
    });
  });

  it('gives up waiting after the failsafe delay so the skeleton cannot hang', () => {
    jasmine.clock().tick(9999);
    fixture.detectChanges();
    expect(component.isDiagramReady()).toBeFalse();
    jasmine.clock().tick(2);
    expect(component.isDiagramReady()).toBeTrue();
  });

  it('does not fire the failsafe after the diagram reported ready', () => {
    component.onDiagramReady();
    fixture.detectChanges();
    jasmine.clock().tick(20000);
    service.remountDiagram();
    fixture.detectChanges();
    expect(component.isDiagramReady()).toBeFalse();
  });
});
