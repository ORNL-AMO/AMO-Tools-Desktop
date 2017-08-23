import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredSteamComponent } from './metered-steam.component';

describe('MeteredSteamComponent', () => {
  let component: MeteredSteamComponent;
  let fixture: ComponentFixture<MeteredSteamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredSteamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredSteamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
