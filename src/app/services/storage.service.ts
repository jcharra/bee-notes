import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage-angular";

@Injectable({
  providedIn: "root",
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async get(key: string) {
    return this._storage ? await this._storage.get(key) : Promise.resolve(null);
  }

  set(key: string, data: any) {
    return this._storage?.set(key, data);
  }

  remove(key: string) {
    this._storage.remove(key);
  }
}
