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
import { AutotestsSetup } from './types';
import e2e from './index';

export const useAutotestsSetups = () => {
  const [autotestsSetups, setAutotestsSetups] = useState<Record<string, AutotestsSetup>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await e2e.getSetups();
        setAutotestsSetups(data);
      } catch (e) {
        alert('Failed fetch setups from e2e repo: ' + (e as any)?.message || JSON.stringify(e));
      }
    })();
  }, []);

  return autotestsSetups;
};
