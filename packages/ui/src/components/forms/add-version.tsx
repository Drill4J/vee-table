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
import connection from '../../github/connection';
import SelectField from './generic/select-field';
import Spinner from '../spinner';
import { useState } from 'react';
import { LedgerData } from '../../lib/types';
import { Ledger } from '@drill4j/vee-ledger';

const VERSION_PLACEHOLDER = 'SemVer, e.g. x.y.z';

export default (props: { ledger: Ledger; data: LedgerData }) => {
  if (!Array.isArray(props.data.components) || props.data.components.length === 0) {
    return <Spinner>No available components. Create components first</Spinner>;
  }
  const components = props.data.components.map(x => ({ value: x.id, label: x.name }));
  const [versionPlaceholder, setVersionPlaceholder] = useState(VERSION_PLACEHOLDER);
  return (
    <>
      <h3>New version</h3>
      <Formik
        initialValues={{ componentId: '', tag: '', date: '' }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await props.ledger.addVersion({
              componentId: values.componentId,
              tag: values.tag,
            });

            window.location.reload(); // pro react development
          } catch (e) {
            alert('Action failed: ' + (e as any)?.message || JSON.stringify(e));
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <label htmlFor="add-version-field-component-id">Component</label>
            <Field
              id="add-version-field-component-id"
              name="componentId"
              component={SelectField(async (componentId: string, form) => {
                const ledger = await connection.getLedgerInstance();
                if (!ledger) return;
                const latestVersion = await ledger.getLatestVersion(componentId);
                if (!latestVersion) {
                  setVersionPlaceholder(VERSION_PLACEHOLDER);
                  return;
                }
                setVersionPlaceholder(`latest is ${latestVersion.tag}`);
              })}
              options={components}
            />
            <ErrorMessage name="componentId" component="div" />

            <label htmlFor="add-version-field-tag">Version Tag</label>
            <Field id="add-component-field-tag" type="text" name="tag" placeholder={versionPlaceholder} />
            <ErrorMessage name="tag" component="div" />

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
