const assert = require("assert")
const puppeteer = require("puppeteer")
const { SIGNIN_URL } = require("../test-messages")
const { HOME_URL } = require("../test-messages")

let browser, page
jest.setTimeout(30000)

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
    devtools: false
  })

  page = await browser.newPage()
  await page.goto(SIGNIN_URL)
})

afterEach(async () => {
  await browser.close()
})

test("Should through error Wrong credentials", async () => {
  const url = await page.url()
  assert(url === SIGNIN_URL)

  var el = await page.$("[name=username]")
  await el.type("dhwani@inficube.net")
  var elpass = await page.$("[name=password]")
  await elpass.type("Test@@123")
  await page.waitFor('button[class="ui red button"]')
  await page.click('button[class="ui red button"]')
  await page.waitFor('ul[class="list"]')
  const element = await page.$(".list")
  const text = await (await element.getProperty("textContent")).jsonValue()
  assert(text === "Wrong credentials! Have you tried signing in using Google or Facebook?")
})

test("Should through error User not found", async () => {
  const url = await page.url()
  assert(url === SIGNIN_URL)

  var el = await page.$("[name=username]")
  await el.type("mofvfdvdftobot")
  var elpass = await page.$("[name=password]")
  await elpass.type("Test@123")
  await page.waitFor('button[class="ui red button"]')
  await page.click('button[class="ui red button"]')
  await page.waitFor('ul[class="list"]')
  const element = await page.$(".list")
  const text = await (await element.getProperty("textContent")).jsonValue()
  console.log("text", text)
  assert(text === "Invalid email address")
})

test("Test Login page", async () => {
  var url = await page.url()
  assert(url === SIGNIN_URL)

  var el = await page.$("[name=username]")
  await el.type("dhwani@inficube.net")
  var elpass = await page.$("[name=password]")
  await elpass.type("12345678")
  await page.waitFor('button[class="ui red button"]')
  await page.click('button[class="ui red button"]')
  await page.waitForNavigation()
  url = await page.url()
  console.log("url", url)
  assert(url === HOME_URL)
})
