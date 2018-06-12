import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredSteamHelpComponent } from './metered-steam-help.component';

describe('MeteredSteamHelpComponent', () => {
  let component: MeteredSteamHelpComponent;
  let fixture: ComponentFixture<MeteredSteamHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredSteamHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredSteamHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
