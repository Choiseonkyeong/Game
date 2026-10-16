"""Fetch the pinned Three.js browser build and verify its published SHA-512."""
from pathlib import Path
import urllib.request
import tarfile
import io
import hashlib
import base64

ROOT = Path(__file__).resolve().parent.parent
URL = 'https://registry.npmjs.org/three/-/three-0.180.0.tgz'
INTEGRITY = 'o+qycAMZrh+TsE01GqWUxUIKR1AL0S8pq7zDkYOQw8GqfX8b8VoCKYUoHbhiX5j+7hr8XsuHDVU6+gkQJQKg9w=='

def main():
    data = urllib.request.urlopen(URL, timeout=60).read()
    if base64.b64encode(hashlib.sha512(data).digest()).decode() != INTEGRITY:
        raise RuntimeError('Three.js package integrity verification failed')
    target = ROOT / 'dist' / 'vendor'
    target.mkdir(parents=True, exist_ok=True)
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as archive:
        for filename, member in [('three.module.js', 'package/build/three.module.js'), ('three.core.js', 'package/build/three.core.js'), ('THREE-LICENSE.txt', 'package/LICENSE')]:
            (target / filename).write_bytes(archive.extractfile(member).read())
    print('Three.js 0.180.0 prepared; SHA-512 verified.')

if __name__ == '__main__':
    main()
