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
import e2e from '../../../e2e';
import { keyValueToArr } from '../../forms/util';
import { RawVersion } from '@drill4j/vee-ledger/src/types-internal';
import { AutotestsSetup } from '../../../e2e/types';

interface Props {
  params: Record<string, string>;
  componentsVersions: Record<string, string>;
  userLogin: string;
  autotestsSetups: Record<string, AutotestsSetup>;
  setupId: string;
}

export default function RestartRunCell(props: Props) {
  const { params, componentsVersions, autotestsSetups, userLogin, setupId } = props;
  return (
    <button
      className="w-full"
      onClick={async () => {
        try {
          const response = await e2e.startSetup({
            versions: keyValueToArr('componentId', 'tag')(componentsVersions) as RawVersion[],
            params: params,
            setupId,
            cypressEnv: autotestsSetups[setupId].cypressEnv,
            specFile: autotestsSetups[setupId].file,
            initiator: {
              userName: userLogin,
              reason: 'Manual start setup with parameter',
            },
          });
          if (!response.ok) {
            alert(`Failed to start setup: ${response.status}`);
          } else {
            alert('Setup started successfully');
          }
        } catch (e) {
          alert('Action failed: ' + (e as any)?.message || JSON.stringify(e));
        }
      }}
    >
      Retry
    </button>
  );
}
