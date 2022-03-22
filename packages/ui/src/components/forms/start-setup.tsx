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
import { Formik, Form, Field } from 'formik';
import SelectField from './generic/select-field';
import { RawVersion } from '@drill4j/vee-ledger';
import VersionsSelect from '../versions-select';
import { useEffect, useMemo, useState } from 'react';
import e2e from '../../e2e';
import { arrToKeyValue, keyValueToArr } from './util';
import useUser from '../../github/hooks/use-user';
import { FormProps } from './types';

interface AutotestsSetup {
  file: string;
  cypressEnv: Record<string, string>;
  params: Record<string, string>[];
}

const initialValues = { setupId: '', isCustomParams: false, componentsVersions: {}, params: '' };

export default (props: FormProps) => {
  const [autotestsSetups, setAutotestsSetups] = useState<Record<string, AutotestsSetup>>({});
  const [componentIds, setComponentIds] = useState<string[]>([]);
  const { data: useData } = useUser();

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

  return (
    <Formik
      initialValues={{ setupId: '', isCustomParams: false, componentsVersions: {}, params: '' }}
      onSubmit={async ({ setupId, componentsVersions, params }, form) => {
        try {
          const response = await e2e.startSetup({
            versions: keyValueToArr('componentId', 'tag')(componentsVersions) as RawVersion[],
            params: JSON.parse(params),
            setupId,
            cypressEnv: autotestsSetups[setupId].cypressEnv,
            specFile: autotestsSetups[setupId].file,
            initiator: {
              userName: useData.login,
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
      {({ isSubmitting, values }) => (
        <Form>
          <label htmlFor="start-setup-setup-id">Setup</label>
          <Field
            id="start-setup-setup-id"
            name={'setupId'}
            component={SelectField(async (setupId, form) => {
              const ids = props.ledger.getSetupById(setupId)?.componentIds || [];
              const latestVersions = props.ledger.getComponentsLatestVersions(ids);

              form.resetForm({
                values: {
                  componentsVersions: arrToKeyValue('componentId', 'tag')(latestVersions),
                  setupId,
                },
              });
              setComponentIds(ids);
            })}
            options={Object.entries(autotestsSetups).map(([id]) => ({ value: id, label: id }))}
          />
          {values.setupId && <FormSetParams values={values} autotestsSetups={autotestsSetups} />}
          <label htmlFor="add-test-field-status">Component Versions</label>
          <VersionsSelect componentIds={componentIds} ledger={props.ledger} fieldNamePrefix={'componentsVersions'} />
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
          {isSubmitting && <div>submitting...</div>}
        </Form>
      )}
    </Formik>
  );
};

function FormSetParams({ values, autotestsSetups }: { values: any; autotestsSetups: Record<string, AutotestsSetup> }) {
  const options = useMemo(
    () =>
      autotestsSetups[values.setupId].params.map(params => {
        const str = JSON.stringify(params, undefined, 2); // prettify json in textarea
        return { value: str, label: str };
      }),
    [autotestsSetups, values.setupId],
  );

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label htmlFor={`custom-params-checkbox`}>Custom params</label>
          <Field id={`custom-params-checkbox`} name={`isCustomParams`} type={'checkbox'} />
        </div>
        <label htmlFor={`params`}>Params</label>
        {values.isCustomParams ? (
          <Field id={`params`} name={`params`} as={'textarea'} />
        ) : (
          <Field id={'start-setups-params'} name={`params`} component={SelectField()} options={options} />
        )}
      </div>
    </>
  );
}
