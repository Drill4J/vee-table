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
// credits to https://gist.github.com/hubgit/e394e9be07d95cd5e774989178139ae8
import { FieldProps } from 'formik';
import React from 'react';
import Select, * as ReactSelect from 'react-select';

// TODO fix dirty hacks with cb
export default (onChangeCb: (...args: any[]) => any = () => null): React.SFC<ReactSelect.Props & FieldProps> =>
  ({ options, field, form }) =>
    (
      <Select
        options={options}
        name={field.name}
        className={'select-field'}
        value={options ? options.find((x: any) => x.value === field.value) : ''}
        onChange={(option: any) => {
          form.setFieldValue(field.name, option.value);
          onChangeCb(option.value, form);
        }}
        onBlur={field.onBlur}
      />
    );
