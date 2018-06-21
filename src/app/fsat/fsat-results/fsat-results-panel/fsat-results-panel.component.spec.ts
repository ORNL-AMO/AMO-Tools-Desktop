import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatResultsPanelComponent } from './fsat-results-panel.component';

describe('FsatResultsPanelComponent', () => {
  let component: FsatResultsPanelComponent;
  let fixture: ComponentFixture<FsatResultsPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatResultsPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatResultsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
