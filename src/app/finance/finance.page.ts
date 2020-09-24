import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-finance',
  templateUrl: './finance.page.html',
  styleUrls: ['./finance.page.scss'],
})
export class FinancePage implements OnInit {
  items = ['1€', '-2€', '3€']
  constructor() { }

  ngOnInit() {
  }

}
