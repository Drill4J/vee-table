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
import useLedgerChange from '../github/hooks/use-ledger-change';

export function ElapsedSinceChange() {
  const elapsedMsg = useLedgerChange();
  if (elapsedMsg === null) return null;

  return (
    <div>
      <span>
        Detected changes
        {elapsedMsg}
      </span>
      <span>Hard refresh (CTRL+F5) to view changes </span>
    </div>
  );
}
