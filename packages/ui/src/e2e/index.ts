/*
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { RawVersion } from '@drill4j/vee-ledger/src/types-internal';
import connection from '../github/connection';

export const getSetups =  async () =>  {
  const res = await fetch("https://raw.githubusercontent.com/Drill4J/e2e/main/setups.json")
  if(!res.ok) {
    throw new Error(res.statusText)
  }
  return await res.json();
}

interface StartSetupsForComponentPayload {
  versions: RawVersion[];
  componentId: string;
}

interface StartAllSetupsPayload {
  versions: RawVersion[];
}

interface StartSetupPayload {
  versions: RawVersion[];
  params: Record<string, string>;
  setupId: string;
  cypressEnv: Record<string, string>;
  specFile: string;
}

const startSetupsForComponent = async (payload: StartSetupsForComponentPayload) => {
  return dispatchToE2e({
    event_type: "run_test_for_component",
    client_payload: payload
  })
}

const startSetup =  async (payload: StartSetupPayload) => {
  return dispatchToE2e({
    event_type: "run_setup",
    client_payload: payload
  })
}

const startAllSetups = async (payload: StartAllSetupsPayload) => {
  return dispatchToE2e({
    event_type: "run_all_setups",
    client_payload: payload
  })
}

function dispatchToE2e(body: any) {
  return fetch("https://api.github.com/repos/Drill4J/e2e/dispatches", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Authorization": `Bearer ${connection.getAuthToken()}`
    }
  })
}

export default {
  startAllSetups,
  startSetup,
  startSetupsForComponent,
  getSetups
}
