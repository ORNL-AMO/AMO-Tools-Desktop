import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteredSteamFormComponent } from './metered-steam-form.component';

describe('MeteredSteamFormComponent', () => {
  let component: MeteredSteamFormComponent;
  let fixture: ComponentFixture<MeteredSteamFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeteredSteamFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeteredSteamFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
