import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizeTabsComponent } from './visualize-tabs.component';

describe('VisualizeTabsComponent', () => {
  let component: VisualizeTabsComponent;
  let fixture: ComponentFixture<VisualizeTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizeTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizeTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
