import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamPropertiesPhGraphComponent } from './steam-properties-ph-graph.component';

describe('SteamPropertiesPhGraphComponent', () => {
  let component: SteamPropertiesPhGraphComponent;
  let fixture: ComponentFixture<SteamPropertiesPhGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamPropertiesPhGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamPropertiesPhGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
