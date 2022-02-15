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
import { Component } from '@drill4j/vee-ledger';
import { useEffect, useMemo, useState } from 'react';
import { Ledger } from '@drill4j/vee-ledger';
import { startsWith, stripPrefix } from './util';
import Question from '../question';
import Alert from '../alert';
import useUser from '../../github/hooks/use-user';
import { FormProps } from './types';

export default (props: FormProps) => {
  if (!Array.isArray(props.data.setups) || props.data.setups.length === 0) {
    return <Spinner>No available setups. Create setups first</Spinner>;
  }
  const setups = props.data.setups.map(x => ({ value: x.id, label: x.name }));
  const [components, setComponents] = useState<Component[]>([]);
  const { data: userData } = useUser()

  return (
    <>
      <h3>New test result</h3>
      <Formik
        initialValues={{ setupId: '', status: '', description: '', componentVersionMap: {} }}
        onSubmit={async ({ setupId, status, description, ...other }, { setSubmitting }) => {
          try {
            const componentVersionMap = Object.entries(other)
              .filter(([key]) => startsWith('component-')(key))
              .reduce((a: Record<string, string>, [key, version]) => {
                a[stripPrefix('component-')(key)] = version;
                return a;
              }, {});

            await props.ledger.addTest({
              setupId,
              status,
              componentVersionMap,
              description,
              initiator: {
                userName: userData?.name,
                reason: "Manual publish tests result"
              }
            });

            window.location.reload(); // pro react development
          } catch (e) {
            alert('Action failed: ' + (e as any)?.message || JSON.stringify(e));
            // not so sure about that finally
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <label htmlFor="add-test-field-setup-id">Setup</label>
            <Field
              id="add-test-field-setup-id"
              name={'setupId'}
              component={SelectField(async (setupId: string, form) => {
                const components = await props.ledger.getSetupComponents(setupId);
                setComponents(components);
                form.resetForm({
                  values: { setupId, status: form.values.status, description: form.values.description, componentVersionMap: {} },
                });
              })}
              options={setups}
            />
            <ErrorMessage name="setupId" component="div" />

            <label htmlFor="add-test-field-status">Status</label>
            <Field id="add-component-field-status" type="text" name="status" placeholder="anything (passed, failed?)" />
            <ErrorMessage name="status" component="div" />

            <label htmlFor="add-test-field-description">Description (optional)</label>
            <Field id="add-component-field-description" type="text" name="description" placeholder="something informative" />
            <ErrorMessage name="description" component="div" />

            <label htmlFor="add-test-field-status">Component Versions</label>
            <Versions components={components} ledger={props.ledger} />
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
            {isSubmitting && <div>submitting...</div>}
          </Form>
        )}
      </Formik>
      <Question>
        <span>IDEA #1: Allow to configure hook on test result submission</span>
        <br />
        <span>| {'e.g. if (test.status === "failed") req.("POST our.mail.proxy/?recipients={setup.maintainers}", test)'}</span>
      </Question>
    </>
  );
};

// FIXME don't toss ledger around, obtain it directly instead
function useVersions(componentIds: string[], ledger: Ledger): { isLoading: boolean; vers: Record<string, string[]>; error: string } {
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

function Versions(props: { ledger: Ledger; components: Component[] }) {
  const components = props.components;
  const componentIds = useMemo(() => components.map(x => x.id), [components]);
  const { isLoading: isLoadingVersionsData, vers, error } = useVersions(componentIds, props.ledger);

  if (!Array.isArray(components) || components.length === 0) return <Spinner>...select setup first</Spinner>;
  if (isLoadingVersionsData) return <Spinner>loading versions</Spinner>;
  if (error) return <Alert>{error}</Alert>;

  return (
    <table>
      <tbody>
        {components.map(component => (
          <tr key={component.id}>
            <td>
              <label style={{ cursor: 'pointer' }} htmlFor={`add-test-field-component-${component.id}`}>
                {component.name}
              </label>
            </td>
            <td>
              {!Array.isArray(vers[component.id]) ? (
                'no versions'
              ) : (
                <Field
                  id={`add-test-field-component-${component.id}`}
                  name={`component-${component.id}`}
                  component={SelectField()}
                  options={vers[component.id].map(versionTag => ({ value: versionTag, label: versionTag }))}
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
