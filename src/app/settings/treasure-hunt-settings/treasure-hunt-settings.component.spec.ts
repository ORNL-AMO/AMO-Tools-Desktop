import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntSettingsComponent } from './treasure-hunt-settings.component';

describe('TreasureHuntSettingsComponent', () => {
  let component: TreasureHuntSettingsComponent;
  let fixture: ComponentFixture<TreasureHuntSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
