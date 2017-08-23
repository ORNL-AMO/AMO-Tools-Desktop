import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergySteamComponent } from './designed-energy-steam.component';

describe('DesignedEnergySteamComponent', () => {
  let component: DesignedEnergySteamComponent;
  let fixture: ComponentFixture<DesignedEnergySteamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergySteamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergySteamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
