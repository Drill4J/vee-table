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

type PlaceholderProps = {
  authenticate: (...arg: any[]) => any;
};

export default function (props: PlaceholderProps) {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          alignContent: 'center',
          height: 'calc(100vh - 39px)',
          width: '100%',
        }}
      >
        <h2 style={{ flex: '1', textAlign: 'center' }}>
          You cannot see anything yet <br />
          because <br /> you must{' '}
          <span
            style={{ color: 'white', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={e => {
              e.preventDefault();
              props.authenticate();
            }}
          >
            Authenticate
          </span>
        </h2>
      </div>
      <img
        alt="placeholder"
        style={{ width: '100%', height: 'calc(100vh - 39px)' }}
        src="https://img5.goodfon.ru/original/1920x1080/c/cb/sea-bird-grey-ocean.jpg" // FIXME this is probably copyrighted and is very depressing :D
      />
    </div>
  );
}
