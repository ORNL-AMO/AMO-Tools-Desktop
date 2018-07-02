import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamPropertiesFormComponent } from './steam-properties-form.component';

describe('SteamPropertiesFormComponent', () => {
  let component: SteamPropertiesFormComponent;
  let fixture: ComponentFixture<SteamPropertiesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamPropertiesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamPropertiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
