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
import { useEffect, useMemo, useState } from 'react';

import VersionsSelect from '../versions-select';
import e2e from '../../e2e';
import { arrToKeyValue, keyValueToArr } from './util';
import useUser from '../../github/hooks/use-user';
import { FormProps } from './types';
import { AutotestsSetup, Branch } from '../../e2e/types';
import { useAutotestsSetups } from '../../e2e/use-autotests-setups';

export default (props: FormProps) => {
  const autotestsSetups = useAutotestsSetups();
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const branches = await e2e.getBranches();
        setBranches(branches);
      } catch (e) {
        alert('Failed fetch branches from e2e repo: ' + (e as any)?.message || JSON.stringify(e));
      }
    })();
  }, []);

  const [componentIds, setComponentIds] = useState<string[]>([]);
  const { data: useData } = useUser();

  return (
    <Formik
      initialValues={{
        setupId: '',
        isCustomParams: false,
        componentsVersions: {},
        params: '',
        repeatsCount: 1,
        ref: 'main',
        isCommitHash: false,
      }}
      onSubmit={async ({ setupId, componentsVersions, params, repeatsCount, ref }) => {
        let countOfSuccessfullyStartedSetups = 0;
        try {
          for (let i = 1; i <= repeatsCount; i++) {
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
              ref,
            });
            if (response.ok) {
              countOfSuccessfullyStartedSetups += 1;
            }
          }
          alert(`Successfully started ${countOfSuccessfullyStartedSetups} of ${repeatsCount} setups`);
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
          <label htmlFor="repeatsCount">Repeats count</label>
          <Field id="repeatsCount" name={'repeatsCount'} placeholder={'Repeats count'} type={'number'} min={1} />
          <div className="flex gap-x-4">
            <div>
              <label htmlFor={`isCommitHash`} className="mr-2">
                Enter the commit hash
              </label>
              <Field id={`isCommitHash`} name={`isCommitHash`} type={'checkbox'} />
            </div>
            <div className="grow">
              <label htmlFor="ref">Branch or commit hash</label>
              <Field
                className={'w-full h-[38px]'}
                id="ref"
                name="ref"
                placeholder={'Select branch or type commit hash'}
                component={values?.isCommitHash ? 'input' : SelectField()}
                options={branches.map(({ name }) => ({ value: name, label: name }))}
              />
            </div>
          </div>
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
