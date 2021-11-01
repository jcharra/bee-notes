import { Injectable } from "@angular/core";
import { StorageService } from "./storage.service";

export enum LocalStorageKey {
  SWARMS = "swarms",
  JOURNAL_ENTRIES = "journal_entries",
  GROUPS = "groups",
  REMINDERS = "reminders",
}

interface StorageEntry {
  timestamp: Date;
  data: any;
}

@Injectable({
  providedIn: "root",
})
export class StorageSyncService {
  constructor(private storageService: StorageService) {}

  async getFromStorage(key: LocalStorageKey, appendix: string = "") {
    const storageEntry: StorageEntry = await this.storageService.get(key + appendix);
    const dataFromStorage = storageEntry ? storageEntry.data : null;
    return dataFromStorage;
  }

  writeToStorage(key: LocalStorageKey, data: any, appendix: string = "") {
    const timestamp = new Date();
    const storageEntry = {
      timestamp,
      data,
    };
    this.storageService.set(key + appendix, storageEntry);
  }

  clearFromStorage(key: LocalStorageKey, appendix: string = ""): Promise<any> {
    return this.storageService.remove(key + appendix);
  }

  clearStorage() {
    return this.storageService.clear();
  }
}
