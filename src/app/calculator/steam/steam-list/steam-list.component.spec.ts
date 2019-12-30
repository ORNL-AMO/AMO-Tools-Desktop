import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteamListComponent } from './steam-list.component';

describe('SteamListComponent', () => {
  let component: SteamListComponent;
  let fixture: ComponentFixture<SteamListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteamListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteamListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
