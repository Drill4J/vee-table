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
import { Ledger } from '@drill4j/vee-ledger';

export default function useVersions(componentIds: string[], ledger: Ledger): { isLoading: boolean; vers: Record<string, string[]>; error: string } {
  const [vers, setVers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const availableVersions = await ledger.getComponentsVersions(componentIds);
        setVers(availableVersions);
      } catch (e: any) {
        setError(`Failed to load versions. Error: ${e?.message || 'unknown'}`);
      }
      setIsLoading(false);
    })();
  }, [componentIds]); // FIXME missing ledger dep

  return { isLoading, vers, error };
}
