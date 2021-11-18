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
import useUser from '../github/hooks/use-user';
import Spinner from './spinner';

export default function () {
  const { isLoading, data } = useUser();
  if (isLoading) {
    return <Spinner> waiting to receive user data... </Spinner>;
  }

  if (!data) {
    return <div>you are not authenticated</div>;
  }

  return (
    <div style={{ display: 'flex', marginRight: '15px' }}>
      <span>Hi there</span>
      <a className="github-user-link" href={data?.html_url}>
        <img style={{ margin: '0 7px' }} alt="user-avatar" className="avatar" src={data.avatar_url} />
        <span>{data?.login}</span>
        <span>!</span>
      </a>
    </div>
  );
}
