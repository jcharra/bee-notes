import { Component, Input, OnInit } from "@angular/core";

export enum MiteColor {
  WHITE = "filterWhite",
  ORANGE = "filterOrange",
  RED = "filterRed",
}

export enum MiteSize {
  large = "large",
  small = "small",
}

@Component({
  selector: "mite",
  template:
    '<ion-img [ngClass]="[color, size]" src="assets/img/mite.png"></ion-img>',
  styleUrls: ["./mite.component.scss"],
})
export class MiteComponent implements OnInit {
  @Input() color: MiteColor = MiteColor.WHITE;
  @Input() size: MiteSize = MiteSize.large;

  constructor() {}

  ngOnInit() {}
}
