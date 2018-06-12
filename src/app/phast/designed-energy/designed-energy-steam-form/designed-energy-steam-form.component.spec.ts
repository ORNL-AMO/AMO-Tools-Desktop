import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignedEnergySteamFormComponent } from './designed-energy-steam-form.component';

describe('DesignedEnergySteamFormComponent', () => {
  let component: DesignedEnergySteamFormComponent;
  let fixture: ComponentFixture<DesignedEnergySteamFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DesignedEnergySteamFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignedEnergySteamFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
