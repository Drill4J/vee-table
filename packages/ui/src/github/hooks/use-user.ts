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
import { useEffect, useState } from 'react';
import connection from '../connection';

export default function () {
  const [data, setData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const ledger = await connection.getLedgerInstance();
        if (!ledger) {
          return;
        }
        const response = await ledger.getOctokitInstance().request(`GET /user`);
        if (response.status !== 200) {
          const msg = 'ERROR: Failed to obtain user data. Open development console, copy error log and contact the development team';
          console.error(msg, '\n', 'response', response, '---ERROR LOG END---');
          throw new Error(msg);
        }
        setData(response.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { data, isLoading };
}
