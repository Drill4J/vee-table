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
import {Setup} from "../../../../ledger";

export function stripPrefix(prefix: string) {
  const prefixRegex = new RegExp(`^${prefix}`);
  return (x: string) => x.replace(prefixRegex, '');
}

export function startsWith(search: string) {
  return (str: string) => str.indexOf(search) === 0;
}

export const keyValueToArr = (keyName: string, valueName: string) => (data: Record<string, string>) =>
  Object.entries(data)
    .map(([key, value]) => ({ [keyName]: key, [valueName]: value }))

export const arrToKeyValue = (key: string, value: string) => (data: any[]) => data.reduce((acc, item) => ({ ...acc, [item[key]]: item[value] }), {})

export const getSetupsComponentsIds = (setups: Setup[]) => Array.from(new Set( // unique elements
  Object.values(setups)
    .reduce((acc, {componentIds}) => [...acc, ...componentIds], [] as string[])))
