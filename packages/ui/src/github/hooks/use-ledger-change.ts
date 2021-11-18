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
import dayjs from 'dayjs';
import relativeTimePlugin from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTimePlugin);

const CHANGE_CHECK_INTERVAL = 30000;
export default function () {
  const [changeTime, setChangeTime] = useState<null | number>(null);
  const [elapsedMsg, setElapsedMsg] = useState<null | string>(null);

  useEffect(() => {
    let intervalFetch: NodeJS.Timeout, intervalUpdate: NodeJS.Timeout;
    (async () => {
      try {
        const ledger = await connection.getLedgerInstance();
        if (!ledger) return;

        const onChange = () => {
          if (changeTime === null) {
            setChangeTime(Date.now());
          }
        };

        intervalFetch = setInterval(() => ledger.checkChanges(onChange), CHANGE_CHECK_INTERVAL);

        intervalUpdate = setInterval(() => {
          if (changeTime !== null) {
            setElapsedMsg(dayjs(changeTime).fromNow());
          }
        }, CHANGE_CHECK_INTERVAL);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      intervalFetch && clearInterval(intervalFetch);
      intervalUpdate && clearInterval(intervalUpdate);
    };
  }, [changeTime]);

  return elapsedMsg;
}
