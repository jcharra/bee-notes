import { Component, Input } from "@angular/core";

@Component({
    selector: "queen-color",
    templateUrl: "./queen-color.component.html",
    styleUrls: ["./queen-color.component.scss"],
    standalone: false
})
export class QueenColorComponent {
  @Input() year: number;
}
