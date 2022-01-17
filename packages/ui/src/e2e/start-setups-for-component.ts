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
import connection from '../github/connection';
import { RawVersion } from '@drill4j/vee-ledger/src/types-internal';

interface Payload {
  versions: RawVersion[];
  componentId: string;
}

export const startSetupsForComponent = async (payload: Payload) => {
  return await fetch("https://api.github.com/repos/Drill4J/e2e/dispatches", {
    method: "POST",
    body: JSON.stringify({
      event_type: "run_test_for_component",
      client_payload: payload
    }),
    headers: {
      "Authorization": `Bearer ${connection.getAuthToken()}`
    }
  })
}
