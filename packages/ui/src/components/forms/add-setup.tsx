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
import { Ledger } from '@drill4j/vee-ledger';
import { LedgerData } from '../../lib/types';
import Spinner from '../spinner';
import { startsWith, stripPrefix } from './util';

export default (props: { ledger: Ledger; data: LedgerData }) => {
  if (!Array.isArray(props.data.components) || props.data.components.length === 0) {
    return <Spinner>No available components. Create components first</Spinner>;
  }

  return (
    <>
      <h3>New setup</h3>
      <Formik
        initialValues={{ id: '', name: '' }}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const { id, name, ...other } = values;
            const componentIds = Object.keys(other).filter(startsWith('component-')).map(stripPrefix('component-'));
            await props.ledger.addSetup({ id, name, componentIds });
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
            <label htmlFor="add-component-field-id">Unique id</label>
            <Field id="add-component-field-id" type="text" name="id" placeholder="unique-dash-lower-case-id" />
            <ErrorMessage name="id" component="div" />

            <label htmlFor="add-setup-field-name">Human-readable name</label>
            <Field id="add-setup-field-name" type="text" name="name" placeholder="My Awesome Setup" />
            <ErrorMessage name="name" component="div" />

            <label htmlFor="id">Select components</label>

            {props.data.components.map(component => (
              <div key={component.id}>
                <Field id={`add-setup-field-${component.id}`} type="checkbox" name={`component-${component.id}`} />
                <label style={{ paddingLeft: '7px' }} htmlFor={`add-setup-field-${component.id}`}>
                  {component.name}
                </label>
              </div>
            ))}

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
