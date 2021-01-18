# How to write test case.
In frontent right now we are doing only e2e testing using library called puppeteer. To run this test case in you local system you have always start your react app and server app. To create test case you need to follow following steps.
1. Create test file in folder __test__/pages/filename.test.js. (Note we are not doing component testing rt now. so you need to right url of page and filename is should be same as page name).
2. Then write your own test logic. Here I am attaching example of test case.
```js
const assert = require("assert")
const puppeteer = require("puppeteer")

let browser, page
jest.setTimeout(30000)

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
    devtools: true,
  })

  page = await browser.newPage()  
  await page.goto("http://localhost:3000/login")
})

afterEach(async () => {
  await browser.close()
})

test("Should through error Wrong credentials", async () => {
  const url = await page.url()
  assert(url === "http://localhost:3000/login")

  var el = await page.$('[name=username]')
  await el.type("motobot")
  var elpass = await page.$('[name=password]')
  await elpass.type("Test@123")
  await page.waitFor('button[type="submit"]');
  await page.click('button[type="submit"]')
  await page.waitFor('ul[class="list"]');
  const element = await page.$(".list");
  const text = await (await element.getProperty('textContent')).jsonValue();
  assert(text === "Wrong credentials")
})

test("Should through error User not found", async () => {
  const url = await page.url()
  assert(url === "http://localhost:3000/login")

  var el = await page.$('[name=username]')
  await el.type("mofvfdvdftobot")
  var elpass = await page.$('[name=password]')
  await elpass.type("Test@123")
  await page.waitFor('button[type="submit"]');
  await page.click('button[type="submit"]')
  await page.waitFor('ul[class="list"]');
  const element = await page.$(".list");
  const text = await (await element.getProperty('textContent')).jsonValue();
  console.log("text", text)
  assert(text === "User not found")
})


test("should able to login and forward it to home page.", async () => {
  var url = await page.url()
  assert(url === "http://localhost:3000/login")

  var el = await page.$('[name=username]')
  await el.type("motobot")
  var elpass = await page.$('[name=password]')
  await elpass.type("test@123")
  await page.waitFor('button[type="submit"]');
  await page.click('button[type="submit"]')
  await page.waitForNavigation();
  url = await page.url()
  console.log("url", url)
  assert(url === "http://localhost:3000/")
})

```

This Above example contains 3 test case in one test suites. You can write multiple test case in 1 test suites.
```js
  const url = await page.url()
  assert(url === "http://localhost:3000/login")

  var el = await page.$('[name=username]')
  await el.type("motobot")
  var elpass = await page.$('[name=password]')
  await elpass.type("Test@123")
  await page.waitFor('button[type="submit"]');
  await page.click('button[type="submit"]')
  await page.waitFor('ul[class="list"]');
  const element = await page.$(".list");
  const text = await (await element.getProperty('textContent')).jsonValue();
  assert(text === "Wrong credentials")
```
In this test case I am finding input element which have props (name) and having value (username, password). Then I am sending values to these input fields. And finally I am find submit button and then I send click event to btn.



