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
import Spinner from './spinner';
import Alert from './alert';
import { Field, useFormikContext } from 'formik';
import SelectField from './forms/generic/select-field';
import { Ledger } from '@drill4j/vee-ledger';
import useVersions from '../github/hooks/use-versions';

export default function (props: { ledger: Ledger; componentIds: string[]; fieldNamePrefix: string }) {
  const { isLoading: isLoadingVersionsData, vers, error } = useVersions(props.componentIds, props.ledger);
  const { values } = useFormikContext<{ isCustomVersion: Record<string, boolean> }>();

  if (!Array.isArray(props.componentIds) || props.componentIds.length === 0) return <Spinner>...select setup first</Spinner>;
  if (isLoadingVersionsData) return <Spinner>loading versions</Spinner>;
  if (error) return <Alert>{error}</Alert>;

  return (
    <table style={{ borderSpacing: '4px', borderCollapse: 'separate' }}>
      <tbody>
        {props.componentIds.map(id => (
          <tr key={id}>
            <td>
              <label htmlFor={`custom-version-${id}`} className="mr-2">
                Custom
              </label>
              <Field id={`custom-version-${id}`} name={`isCustomVersion.${id}`} type={'checkbox'} />
            </td>
            <td>
              <label style={{ cursor: 'pointer' }} htmlFor={`${props.fieldNamePrefix}-${id}`}>
                {id}
              </label>
            </td>
            <td className="min-w-[220px]">
              {!Array.isArray(vers[id]) ? (
                'no versions'
              ) : (
                <Field
                  className="w-full h-[38px]"
                  id={`${props.fieldNamePrefix}-${id}`}
                  name={`${props.fieldNamePrefix}.${id}`}
                  component={values?.isCustomVersion && values?.isCustomVersion[id] ? 'input' : SelectField()}
                  options={vers[id].map(versionTag => ({ value: versionTag, label: versionTag }))}
                />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
