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
import Spinner from '../spinner';
import { LedgerData } from '@drill4j/vee-ledger';
import VersionsSelect from '../versions-select'
import { useState } from 'react';
import { Ledger } from '@drill4j/vee-ledger';
import { RawVersion } from '@drill4j/vee-ledger/src/types-internal';



export default (props: { ledger: Ledger; data: LedgerData }) => {
  if (!Array.isArray(props.data.setups) || props.data.setups.length === 0) {
    return <Spinner>No available setups. Create setups first</Spinner>;
  }
  const {components, setups} = props.data;
  const [componentSetups, setComponentSetups] = useState(setups);
  const [setupsRequiredComponents, setSetupsRequiredComponents] = useState<string[]>([]);

  return (
    <>
      <h3>Start tests for component</h3>
      <Formik
        initialValues={{ componentId: '', componentsVersions: {} }}
        onSubmit={async ({ componentId, componentsVersions }, {setSubmitting}) => {
          try {
            const versions = Object.entries(componentsVersions).map(([componentId = '', tag = '']) => ({componentId, tag} as RawVersion));
            await props.ledger.startTestForComponent(componentId, versions);
          } catch (e) {
            alert('Action failed: ' + (e as any)?.message || JSON.stringify(e));
          } finally {
            setSubmitting(false);
          }
          console.log(componentsVersions, componentId)
        }}
      >
        {({ isSubmitting, values,  }) => (
          <Form>
            <label htmlFor="start-setups-for-component-id">Component</label>
            <Field
              id="start-setups-for-component-id"
              name={'componentId'}
              component={SelectField(async (componentId: string, form) => {
                const filteredSetups = setups.filter(({ componentIds }) => componentIds.includes(componentId));
                const setupsComponents = Array.from(new Set(
                  Object.values(filteredSetups)
                    .reduce((acc: string[], {componentIds}) => [...acc, ...componentIds], [])));
                setComponentSetups(filteredSetups);
                setSetupsRequiredComponents(setupsComponents)
              })}
              options={components.map(x => ({ value: x.id, label: x.name }))}
            />
            <ErrorMessage name="componentId" component="div" />

            {values.componentId &&
              <>
                <ul>
                  Running setups:
                  {
                    componentSetups.filter(({ componentIds }) => componentIds.includes(values.componentId))
                      .map(({ id }) => <li>{id}</li>)
                  }
                </ul>
                <label htmlFor="add-test-field-status">Component Versions</label>
                <VersionsSelect componentIds={setupsRequiredComponents} ledger={props.ledger} fieldNamePrefix={'componentsVersions'}/>
              </>
            }

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


