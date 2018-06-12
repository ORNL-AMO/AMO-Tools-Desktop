import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergySteamHelpComponent } from './designed-energy-steam-help.component';

describe('DesignedEnergySteamHelpComponent', () => {
  let component: DesignedEnergySteamHelpComponent;
  let fixture: ComponentFixture<DesignedEnergySteamHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergySteamHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergySteamHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
