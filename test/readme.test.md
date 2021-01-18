# Motomob Test Documentation

## Installation On Server Side.

Use the package manager [npm](http://npmjs.org/).

```bash
npm install -g newman
```

## Usage

1. You need to install postman into your machine.
2. Then you need to import collection into your postman by using [this link](https://www.getpostman.com/collections/62f3604e141f4a49dac9).
3. You can write test case in test script section.
4. Here I am showing example of test case.
5. For reporting you need to install `npm install -g newman-reporter-htmlextra`

```pm
pm.test('get bike by id', function() {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.getBike).not.eq(undefined)
});
```

## How to run test case into your system

```bash
newman run suite/User_collection.json -e postman_environment.json
```



## Motomob Load Testing.

```bash
sudo apt-get install apache2-utils
ab -n 100 -c 10 https://motomob.me # This command will send 100 request with 10 thread.
ab -p post_loc.json -T application/json -H 'Authorization: Token abcd1234' -c 10 -n 2000 https://motomob.me/gapi # This will send post request with data json file.
```

## References

[Youtube Video Link](https://www.youtube.com/watch?v=Jeklu9MIOpg)  
[Medium Article Link](https://medium.com/@stfalconcom/postman-basics-a-quick-start-for-development-and-testing-a1fbd22db50e)
[Apache Bench Ref.](https://gist.github.com/kelvinn/6a1c51b8976acf25bd78)
