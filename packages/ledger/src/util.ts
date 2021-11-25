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

// import platform from 'browser-or-node'; // TODO bundle it
export function platform() {
  const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
  return { isBrowser, isNode };
}

export function utf8_to_b64(str: string) {
  if (platform().isBrowser) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  if (platform().isNode) {
    return Buffer.from(unescape(encodeURIComponent(str))).toString('base64');
  }
  throw new Error('Unsupported platform');
}

export function b64_to_utf8(str: string) {
  if (platform().isBrowser) {
    return decodeURIComponent(escape(window.atob(str)));
  }
  if (platform().isNode) {
    return decodeURIComponent(escape(Buffer.from(str, 'base64').toString())); // TODO node vs browser
  }
  throw new Error('Unsupported platform');
}

export function validateNonEmptyString(key: string, value: string): void | never {
  if (!value || typeof value !== 'string') {
    throw new Error(`Expected ${key} to be a non-empty string, but got: "${value}"`);
  }
}
