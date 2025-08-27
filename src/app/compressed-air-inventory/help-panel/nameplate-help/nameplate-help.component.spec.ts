import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameplateHelpComponent } from './nameplate-help.component';

describe('NameplateHelpComponent', () => {
  let component: NameplateHelpComponent;
  let fixture: ComponentFixture<NameplateHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NameplateHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NameplateHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
