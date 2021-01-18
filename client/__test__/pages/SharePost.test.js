const { fail } = require("assert")
const assert = require("assert")
const { SIGNIN_URL } = require("../test-messages")
const { HOME_URL } = require("../test-messages")
const { nextTick } = require("process")
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

test("Share an update without discription and image", async () => {
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
  await page.waitForTimeout(1000)
  await page.waitForSelector("#sharepostInput")
  await page.evaluate(() => document.getElementById("sharepostInput").click())

  await page.waitForTimeout(1000)
  await page.waitForSelector("#basicPostSubmit")
  await page.evaluate(() => document.getElementById("basicPostSubmit").click())

  await page.waitForTimeout(3000)
  await page.waitForSelector('span[class="error-message"]')
  const element = await page.$('span[class="error-message"]')
  const text = await (await element.getProperty("textContent")).jsonValue()
  assert(text === "Add some content... Riders would like to read it.")

})

test("Share an update with description and single image", async () => {
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

  await page.waitForTimeout(5000)
  await page.$('form[id = "sharepostInput"]')
  page.click('form[id="sharepostInput"]')
  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.type('div[class="ql-editor ql-blank"]', "Description in motobot.. Share an update with description and single image")
  await page.waitForSelector('div[class="pointer"]')
  const inputUploadHandle = await page.$("input[id=picFile]")
  await inputUploadHandle.uploadFile("./__test__/images/cjmeister-com-_CJ05957.jpg")
  await page.waitForTimeout(3000)
  await page.waitForSelector("#basicPostSubmit")
  await page.evaluate(() => document.getElementById("basicPostSubmit").click())
  await page.waitForTimeout(3000)
})

test("Share an update with description and multiple images", async () => {
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

  await page.waitForTimeout(5000)
  await page.$('form[id = "sharepostInput"]')
  page.click('form[id="sharepostInput"]')
  await page.waitForSelector('div[class="ql-editor ql-blank"]')
  await page.type('div[class="ql-editor ql-blank"]', "Description in motobot.. Share an update with description and multiple images")
  await page.waitForTimeout(3000)
  // await page.waitForSelector('input[id=picFile]');
  await page.waitForSelector('div[class="pointer"]')
  const imageUpload = await page.$("input[id=picFile]")
  await imageUpload.uploadFile(
    "./__test__/images/cjmeister-com-_CJ05957.jpg",
    "./__test__/images/cjmeister-com-_CJ05961.jpg",
    "./__test__/images/cjmeister-com-_CJ05958.jpg",
    "./__test__/images/cjmeister-com-_CJ05968.jpg"
  )
  await page.waitForTimeout(3000)
  await page.waitForSelector("#basicPostSubmit")
  await page.evaluate(() => document.getElementById("basicPostSubmit").click())
})






