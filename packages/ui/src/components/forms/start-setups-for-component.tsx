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
import { Formik, Form, Field, ErrorMessage } from 'formik';
import SelectField from './generic/select-field';
import {LedgerData, RawVersion} from '@drill4j/vee-ledger';
import VersionsSelect from '../versions-select'
import { useState } from 'react';
import { Ledger } from '@drill4j/vee-ledger';
import e2e from '../../e2e';
import {arrToKeyValue, getUniqueComponentIds, keyValueToArr} from './util';

export default (props: { ledger: Ledger; data: LedgerData }) => {
  const {components, setups} = props.data;
  const [componentSetups, setComponentSetups] = useState(setups);
  const [setupsRequiredComponents, setSetupsRequiredComponents] = useState<string[]>([]);

  return (
    <>
      <h3>Start tests for component</h3>
      <Formik
        initialValues={{ componentId: '', componentsVersions: {} }}
        onSubmit={async ({ componentId, componentsVersions }) => {
          try {
            const versions = keyValueToArr('componentId', 'tag')(componentsVersions) as RawVersion[];
            const response = await e2e.startSetupsForComponent({componentId, versions});
            if (!response.ok) {
              alert(`Failed to start test: ${response.status}`);
            }
          } catch (e) {
            alert('Action failed: ' + (e as any)?.message || JSON.stringify(e));
          }
        }}
      >
        {({ isSubmitting, values,  }) => (
          <Form>
            <label htmlFor="start-setups-for-component-id">Component</label>
            <Field
              id="start-setups-for-component-id"
              name={'componentId'}
              component={SelectField(async (componentId: string, form) => {
                const setupsForComponent = setups.filter(({ componentIds }) => componentIds.includes(componentId));
                const setupsComponents = getUniqueComponentIds(setupsForComponent)

                const latestVersions = props.ledger.getComponentsLatestVersions(setupsComponents);
                form.setFieldValue("componentsVersions", arrToKeyValue('componentId', 'tag')(latestVersions))

                setComponentSetups(setupsForComponent);
                setSetupsRequiredComponents(setupsComponents)
              })}
              options={components.map(x => ({ value: x.id, label: x.name }))}
            />
            <ErrorMessage name="componentId" component="div" />

            {values.componentId &&
                <ul>
                  Running setups:
                  { componentSetups.map(({ id }) => <li>{id}</li>) }
                </ul>
            }
            <label htmlFor="add-test-field-status">Component Versions</label>
            <VersionsSelect componentIds={setupsRequiredComponents} ledger={props.ledger} fieldNamePrefix={'componentsVersions'}/>
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

