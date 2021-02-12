import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QueenStatusPage } from './queen-status.page';

describe('QueenStatusPage', () => {
  let component: QueenStatusPage;
  let fixture: ComponentFixture<QueenStatusPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueenStatusPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(QueenStatusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
