import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamUsageTableComponent } from './steam-usage-table.component';

describe('SteamUsageTableComponent', () => {
  let component: SteamUsageTableComponent;
  let fixture: ComponentFixture<SteamUsageTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamUsageTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamUsageTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
