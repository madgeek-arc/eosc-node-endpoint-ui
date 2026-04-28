import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../environments/environment";

export interface Capability {
  capability_type: string;
  endpoint: string;
  version: string;
  api_spec: string;
  protocol: string;
  status: string;
}

export interface CapabilitiesObject {
  node_endpoint: string;
  capabilities: Capability[];
}

@Injectable({ providedIn: 'root' })
export class CapabilitiesService {

  constructor(public http: HttpClient) {
  }

  base = environment.API_ENDPOINT;

  getCapabilities() {
    return this.http.get<CapabilitiesObject>(this.base + `/endpoint`);
  }

  updateCapabilities(capabilitiesObject: CapabilitiesObject): Observable<any> {
    const sanitized = {
      ...capabilitiesObject,
      capabilities: capabilitiesObject.capabilities.map(cap =>
        Object.fromEntries(
          Object.entries(cap).map(([key, value]) => [key, value === '' ? null : value])
        )
      )
    };
    return this.http.put(`${this.base}/endpoint`, sanitized);
  }

}
