const { COMMENT_BODY_ERROR } = require("../test-messages")
const { SIGNIN_URL } = require("../test-messages")
const { HOME_URL } = require("../test-messages")
const { POST_URL } = require("../test-messages")
const assert = require("assert")
const puppeteer = require("puppeteer")
let browser, page
jest.setTimeout(30000)
beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: true,
    devtools: false,
    args: ["--start-maximized"]
  })
  page = await browser.newPage()
  await page.goto(SIGNIN_URL)
})
afterEach(async () => {
  await browser.close()
})

test("Comment body must not be empty", async () => {
  var url = await page.url()
  assert(url === SIGNIN_URL)
  var el = await page.$("[name=username]")
  await el.type("motobot")
  var elpass = await page.$("[name=password]")
  await elpass.type("test@123")
  await page.waitFor('button[class="ui red button"]')
  await page.click('button[class="ui red button"]')
  await page.waitForNavigation()
  url = await page.url()
  assert(url === HOME_URL)
  await page.waitFor(5000)

  var postId = await page.evaluate('document.querySelector(".post-body").getAttribute("id")')
  console.log('postId', postId)
  await page.waitFor(1000)

  await page.goto(POST_URL + postId)
  await page.waitFor(2000)

  await page.waitForSelector(".add-new-comment")
  page.click(".add-new-comment")

  await page.waitFor(200)
  await page.waitForSelector('button[type="submit"]')
  await page.waitFor(500)
  await page.click('button[type="submit"]')

  await page.waitFor('ul[class="list"]')
  const element = await page.$(".list")
  const text = await (await element.getProperty("textContent")).jsonValue()
  assert(text === COMMENT_BODY_ERROR)
})

test("Create Comment", async () => {
  var url = await page.url()
  assert(url === SIGNIN_URL)
  var el = await page.$("[name=username]")
  await el.type("motobot")
  var elpass = await page.$("[name=password]")
  await elpass.type("test@123")
  await page.waitFor('button[class="ui red button"]')
  await page.click('button[class="ui red button"]')
  await page.waitForNavigation()
  url = await page.url()
  assert(url === HOME_URL)
  await page.waitFor(6000)

  var postId = await page.evaluate('document.querySelector(".post-body").getAttribute("id")')
  console.log('postId', postId)
  await page.waitFor(1000)

  await page.goto(POST_URL + postId)
  await page.waitFor(2000)

  await page.waitForSelector(".add-new-comment")
  page.click(".add-new-comment")

  await page.waitFor(200)
  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.waitFor(500)
  await page.click('div[class="ql-editor ql-blank"]')
  await page.type('div[class="ql-editor ql-blank"]', "test richtexteditor from create comment")

  await page.waitForSelector('button[type="submit"]')
  await page.click('button[type="submit"]')
})
