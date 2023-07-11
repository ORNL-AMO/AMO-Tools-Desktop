import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplacementInformationComponent } from './replacement-information.component';

describe('ReplacementInformationComponent', () => {
  let component: ReplacementInformationComponent;
  let fixture: ComponentFixture<ReplacementInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReplacementInformationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplacementInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
