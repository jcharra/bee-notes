import { Component, Input } from "@angular/core";

@Component({
  selector: "queen-color",
  templateUrl: "./queen-color.component.html",
  styleUrls: ["./queen-color.component.scss"],
})
export class QueenColorComponent {
  @Input() year: number;
}
