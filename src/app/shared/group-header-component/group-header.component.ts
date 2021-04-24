import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActionSheetController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import {
  SwarmGroup,
  SwarmGroupService,
} from "../../services/swarm-group.service";

@Component({
  selector: "app-group-header",
  templateUrl: "./group-header.component.html",
  styleUrls: ["./group-header.component.scss"],
})
export class GroupHeaderComponent implements OnInit {
  @Input() idx: number;
  @Input() group: SwarmGroup;
  @Output() changeEvent = new EventEmitter<void>();
  @Output() renameEvent = new EventEmitter<string>();

  constructor(
    private swarmGroupService: SwarmGroupService,
    private translate: TranslateService,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {}

  deleteGroup(gid: string) {
    this.swarmGroupService.deleteGroup(gid).subscribe(() => {
      this.changeEvent.emit();
    });
  }

  rename(gid: string) {
    this.renameEvent.emit(gid);
  }
}
