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
import { Formik, Form, } from 'formik';
import {LedgerData, RawVersion} from '@drill4j/vee-ledger';
import VersionsSelect from '../versions-select'
import { useMemo } from 'react';
import { Ledger } from '@drill4j/vee-ledger';
import e2e from '../../e2e';
import {getUniqueComponentIds, keyValueToArr} from './util';
import useUser from '../../github/hooks/use-user';

export default (props: { ledger: Ledger; data: LedgerData }) => {
  const { setups} = props.data;
  const componentIds = useMemo(() => getUniqueComponentIds(setups), [setups])
  const latestVersions = useMemo(() => props.ledger.getComponentsLatestVersions(componentIds).reduce((acc, {componentId, tag}) => ({...acc, [componentId]: tag}), {}), [componentIds])
  const {data: useData} = useUser();

  return (
    <>
      <h3>Start all setups</h3>
      <Formik
        initialValues={{ componentsVersions: latestVersions }}
        onSubmit={async ({ componentsVersions }) => {
          try {
            const response = await e2e.startAllSetups({
              versions: keyValueToArr('componentId', 'tag')(componentsVersions) as RawVersion[],
              initiator: {
                userName: useData.name,
                reason: "Manual start all setups"
              }
            })
            if (!response.ok) {
              alert(`Failed to start tests: ${response.status}`);
            }
          } catch (e) {
            alert('Action failed: ' + (e as any)?.message || JSON.stringify(e));
          }
        }}
      >
        {({ isSubmitting,  }) => (
          <Form>
            <label htmlFor="add-test-field-status">Component Versions</label>
            <VersionsSelect componentIds={componentIds} ledger={props.ledger} fieldNamePrefix={'componentsVersions'}/>
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
            {isSubmitting && <div>submitting...</div>}
          </Form>
        )}
      </Formik>
    </>
  );
};
